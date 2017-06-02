#!/usr/bin/env bash
set -o pipefail

pushd etcd-v2.3.7-linux-amd64

# Define ports and their use
CLIENT_COMM_PORT="2379"
PEER_COMM_PORT="2380"

# These ENV VARs are network related and are based on the hostname
# that HCP gives each component at runtime.
HOST_NAME="hsc-etcd-${HCP_COMPONENT_INDEX}-int"
echo "ETCD container hostname setting: ${HOST_NAME}"

# Update the NO_PROXY ENV VAR if we have a web proxy set
if [ ! -z ${HTTP_PROXY} ] || [ ! -z ${HTTPS_PROXY} ]; then
  echo "Running with a web proxy set - updating NO_PROXY"
  # We will append to NO_PROXY delimiting with "," - so make sure it has a value if there is not one
  if [ -z ${NO_PROXY} ]; then
    export NO_PROXY="127.0.0.1"
  fi
  # Add names to the NO PROXY environment variable
  IFS=',' read -ra ADDR <<< "${ETCD_INITIAL_CLUSTER}"
  for i in "${ADDR[@]}"; do
    HOST="${i%=*}"
    NO_PROXY=${NO_PROXY},${HOST}
  done
  echo "NO_PROXY: ${NO_PROXY}"
  export NO_PROXY=${NO_PROXY}
fi

ADVERTISE_PEER_URLS="http://${HOST_NAME}:${PEER_COMM_PORT}"
echo "Advertise peer URLs: ${ADVERTISE_PEER_URLS}"

ADVERTISE_CLIENT_URLS="http://${HOST_NAME}:${CLIENT_COMM_PORT}"
echo "Advertise client URLs: ${ADVERTISE_CLIENT_URLS}"

# These ENV VARs are defined/set in SDL and are applicable for each
# node that comes up
echo "Listen peer URLs: ${ETCD_LISTEN_PEER_URLS}"
echo "Listen client URLs: ${ETCD_LISTEN_CLIENT_URLS}"
echo "Initial cluster token: ${ETCD_INITIAL_CLUSTER_TOKEN}"
echo "Initial cluster state: ${ETCD_INITIAL_CLUSTER_STATE}"
echo "Initial cluster: ${ETCD_INITIAL_CLUSTER}"
echo "Strict reconfig check is set to: ${ETCD_STRICT_RECONFIG_CHECK}"

echo "Configure logging to FlightRecorder"
log_cmd=''
if [[ -n "$HCP_FLIGHTRECORDER_HOST" && -n "$HCP_FLIGHTRECORDER_PORT" ]]; then
  log_cmd="2>&1 | tee >(logger -n $HCP_FLIGHTRECORDER_HOST -P $HCP_FLIGHTRECORDER_PORT -t ${HOSTNAME} -u /tmp/ignored)"
  mkdir -p /etc/rsyslog.d
  echo "*.* @@${HCP_FLIGHTRECORDER_HOST}:${HCP_FLIGHTRECORDER_PORT}" > /etc/rsyslog.d/flight-recorder.conf
  service rsyslog start
fi

cmd="./etcd --name ${HOST_NAME} --initial-advertise-peer-urls ${ADVERTISE_PEER_URLS} --advertise-client-urls ${ADVERTISE_CLIENT_URLS}"
echo "etcd startup command to be executed: $cmd $log_cmd"

echo "Starting etcd..."
eval "$cmd $log_cmd"
