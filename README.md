# How to generate traces with your SQL database with the SQLCommenter

This repository is here to guide you through the GitHub tutorial that goes hand-in-hand with a video available on YouTube and a detailed blog post on my website. 
Together, these resources are designed to give you a complete understanding of the topic.


Here are the links to the related assets:
- YouTube Video: [How to generate traces with your SQL database with the SQLCommenter](https://www.youtube.com/watch?v=REZUQsUL030)
- Blog Post: [How to generate traces with your SQL database with the SQLCommenter](https://isitobservable.io/open-telemetry/traces/how-to-generate-traces-with-your-sql-database-with-the-sqlcommenter)


Feel free to explore the materials, star the repository, and follow along at your own pace.


## The SqlCommenter - How to get started
<p align="center"><img src="/image/sqlcommenter_logo.png" width="40%" alt="Loki Logo" /></p>

This repository showcases the usage of the SqlCommenter by using GKE with a simple NodeJS application

This episode will require several GCP services :
- GKE
- Google Cloud SQL
- Google Cloud Trace

## Prerequisite
The following tools need to be installed on your machine :
- jq
- kubectl
- git
- gcloud

### I. Create the GKE cluster
#### 1. Create a Google Cloud Platform Project
```
export PROJECT_ID="<your-project-id>"
gcloud services enable container.googleapis.com --project ${PROJECT_ID}
gcloud services enable monitoring.googleapis.com \
cloudtrace.googleapis.com \
clouddebugger.googleapis.com \
cloudprofiler.googleapis.com \
--project ${PROJECT_ID}
```
#### 2. Create a GKE cluster
```
export ZONE=us-central1-b
gcloud containr clusters create isitobservable \
--project=${PROJECT_ID} --zone=${ZONE} \
--machine-type=e2-standard-2 --num-nodes=2
```
## 3. Clone the GitHub repo
```
git clone https://github.com/isItObservable/Episode-9----SqlCommenter.git
cd Episode-9----SqlCommenter
```

### II. Create the Cloud SQL database
#### 1. Google SQL instance
The current solution requires the usage of a PostgreSQL database hosted in Google SQL
```
export INSTANCE_NAME=sqlcommenterDemo
export REGION=us-central1
gcloud sql instances create ${INSTANCE_NAME} \
--database-version=POSTGRES_12 \
--cpu=4 \
--memory=7680MB \
--region=${REGION} \
--zone=${ZONE}
```
#### 2. Google SQL user 
```
export USER=postgres
export PASSWORD=<YOUR PASSWORD>
gcloud sql users set-password  \
--instance=${INSTANCE_NAME} \
--password=${PASSWORD}
```
#### 3. Create demo database: todos
```
gcloud sql databases create todos \
--instance=${INSTANCE_NAME} \
```
### III. Create a GCP service account

#### 1. Enable the Cloud SQL Admin API 
To enable the API on your GCP project, click on the following link : [Enable the API](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin&redirect=https://console.cloud.google.com&_ga=2.49330982.1057362836.1632993761-1650733473.1617357693)
#### 2. Create a Google Service Account
Within the Google Cloud Console, click on IAM & Admin, Service Accounts
<p align="center"><img src="/image/gsa.PNG" width="40%" alt="GSA" /></p>

#### 3. Assign the right roles to your GSA
Click IAM, Add
In New Principals: type the name of your GSA

Add the following roles: 
* Cloud SQL Admin
* Cloud Trace User
<p align="center"><img src="/image/iam.png" width="40%" alt="GSA" /></p>

#### 4. Create a credential file for your Service account key
```
export YOUR-SA=<YOUR GSA NAME>
gcloud iam service-accounts keys create ~/key.json \
--iam-account=${YOUR-SA}@${PROJECT_ID}.iam.gserviceaccount.com
```
#### 5. Turn your Service Account key into K8s Secret
```
kubectl create namespace sqlcommenter
kubectl create secret generic sa-sqlcommenter --from-file=service_account.json=key.json -n sqlcommenter
```
#### 6. Create the secret with your Database details
postgres-credentials
```
kubectl -n sqlcommenter create secret generic postgres-credentials --from-literal="username=$USER" --from-literal="password=$PASSWORD"
```
#### 7. Retrieve your Cloud SQL Instance connection name
The instance connection name is available in the Cloud SQL Instance details page of the Cloud Console or by using gcloud:
```
glcoud sql instances describe ${INSTANCE_NAME} 
```
This value needs to be stored to update the Kubernetes deployment file:
```
export INSTANCE_CONNECTION=<YOUR INSTANCE CONNECTION NAME>
```
#### 8. Update the Kubernetes deployment files
```
sed -i "s,CLOUDSQL_INSTANCE_TOREPLACE,$INSTANCE_CONNECTION," kubernetes/node-deployment_fromfile.yaml
sed -i "s,PROJECT_ID_TO_REPLACE,$PROJECT_ID," kubernetes/dyngcpcloudsqltrace-deployment.yaml
```
### IV. Dynatrace
#### 1. Start a Dynatrace trial
Go to the following URL to start a [Dynatrace trial](https://www.dynatrace.com/trial/)

#### 2. Generate API Token
The OpenTelementry Collector needs to interact with the Dynatrace Trace Ingest API.
You'll need to generate the api token in Dynatrace and update the OpenTelemetry Deployment files.
Follow the instructions described in the [Dynatrace documentation](https://www.dynatrace.com/support/help/shortlink/api-authentication#generate-a-token)
Make sure that the scope Ingest OpenTelemetry traces is enabled.
<p align="center"><img src="/image/dt_api.png" width="60%" alt="dt api scope" /></p>

We need to update the OpenTelemetry collector deployment file by referring to our Dynatrace tenant
```
export DT_API_TOKEN=<YOUR DT TOKEN>
export DT_API_URL="{your-environment-id}.live.dynatrace.com"
sed -i "s,TENANTURL_TOREPLACE,$DT_API_URL," kubernetes/otel-collector-deployment.yaml
sed -i "s,DT_API_TOKEN_TO_REPLACE,$DT_API_TOKEN," kubernetes/otel-collector-deployment.yaml
```
#### 3. Configure Dynatrace
Before ingesting traces, let's configure Dynatrace to store the various span and resource attributes sent by kspan.
This configuration is important to be able to store the Kubernetes information in the trace
Here are the span attributes that need to be created in Dynatrace ( Settings/service-side monitoring/ span attributes )
* action
* application
* client_addr	
* controller	
* database	
* db_driver	
* framework	
* instance	
* normalized_query	
* query_hash	
* route	
* userid	
* .http.host
* .http.method
* .http.route
* .http.url
* .http.user_agent
* g.co.r.gce_instance.project_id
* g.co.r.gce_instance.zone
* grpc.authority
* grpc.path
* grpc.status_code
* Actual Startup Time	
* Actual Total Time	
* Alias	
* Node Type	
* Operation	
* Relation Name	
* Schema	
* Total Cost	
<p align="center"><img src="/image/dt_span_attribute.png" width="60%" alt="dt api scope" /></p>

### IV. Deployment of the demo application
#### Nodejs Application
```
kubectl apply -f kubernetes/node-deployment_fromfile.yaml -n sqlcommenter
```
#### Create the database Scheme
```sh
kubectl get pods
kubectl exec <POD_NAME> --stdin --tty -- createdb -U sample todos
```
#### Populate the database with a few records
```sh
kubectl get pods
kubectl exec <POD_NAME> knex migrate:latest
kubectl exec <POD_NAME> knex seed:run
```

#### Expose the application with a load balancer
```
kubectl apply -f kubernetes/node-service.yaml -n sqlcommenter
```
#### Expose the cronJob that will collect the traces from Google Cloud Trace
```
kubectl apply -f kubernetes/dyngcpcloudsqltrace-deployment.yaml -n sqlcommenter
```
#### Deploy the OpenTelemetry Collector
```
kubectl apply -f kubernetes/otel-collector-deployment.yaml -n sqlcommenter
```
#### Extract the public API address of the demo app
```sh
kubectl get service node

NAME      TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
node      LoadBalancer   10.39.244.136   35.232.249.48   3000:30743/TCP   2m
```
Test it out:

1. [http://EXTERNAL_IP:3000]/users(http://EXTERNAL_IP:3000/users)
1. [http://EXTERNAL_IP:3000/todos](http://EXTERNAL_IP:3000/todos)


### V. Generate some traffic

This repository contains a load testing project to simulate traffic against our NodeJS demo application.
To be able to run the load test, you'll need to update the load testing project to send the traffic to your own application.
You'll need to update the following files from the Neoload project: 
- loadtest/sqlcommenter_demo/team/variables/host.xml is the file describing the constant variable containing the IP address of the server 
- loadtest/sqlcommenter_demo/team/variables/port.xml is the file describing the variable containing the port of the application.

Download The latest version of [NeoLoad](https://www.neotys.com/support/download-neoload) , [start a trial](https://www.neotys.com/trial) if required
Launch NeoLoad and open the project: loadtest/sqlcommenter_demo/sqlcommenter_demo.nlp
Click on the Scenario Tab and click on run the predefined test.



### V. View the traces in Dynatrace

To visualize the traces in Dynatrace, 
* Click on the menu ( application & Microservices / Distributes traces)
* Filter on "Ingested traces"
<p align="center"><img src="/image/dt_trace.png" width="60%" alt="dt distributed traces" /></p>
