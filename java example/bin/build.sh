#
#
set -e

readonly IMAGE_NAME="demo-app"
readonly IMAGE_TAG="sqlcommenter"

docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
docker tag $IMAGE_NAME:$IMAGE_TAG $IMAGE_NAME:latest
