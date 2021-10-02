const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const opentelemetry = require("@opentelemetry/sdk-node");
const { LogLevel } = require("@opentelemetry/core");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { BatchSpanProcessor } = require("@opentelemetry/tracing");
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { CollectorTraceExporter } = require("@opentelemetry/exporter-collector-grpc");
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const {
  TraceExporter,
} = require("@google-cloud/opentelemetry-cloud-trace-exporter");
const { logger, sleep } = require("./util");
const { context, trace, diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
// const api = require("@opentelemetry/api");
const OTLP_HOST=process.env.OTLP_COLLECTOR_HOST;
const OTLP_PORT=process.env.OTLP_COLLECTOR_PORT

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);


const OTLPoptions = {
    url: "grpc://"+OTLP_HOST+":"+OTLP_PORT,
};


const resources = new Resource({
    'service.name': 'nodejs',
    'application': 'sqlcommenter_demo',
 });


//const collectorExporter = new CollectorTraceExporter(OTLPoptions);

const collectorExporter = new TraceExporter({logger});


const sdk = new opentelemetry.NodeSDK({
    traceExporter: collectorExporter,
    spanProcessor: new BatchSpanProcessor(collectorExporter, {
                                                               bufferSize: 500,
                                                               bufferTimeout: 5 * 1000,
                                                             }),
    instrumentations: [getNodeAutoInstrumentations(),
                           new HttpInstrumentation(),
                           new ExpressInstrumentation(),]
});

sdk.start()

