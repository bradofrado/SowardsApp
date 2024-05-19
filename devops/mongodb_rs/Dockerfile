FROM mongo:4

ENTRYPOINT mongod --port $MONGO_REPLICA_PORT --replSET rs0 --bind_ip 0.0.0.0 & MONGOD_PID=$!; \
INIT_REPL