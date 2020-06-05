#!/bin/bash
set -u
set -e

sleep 5

until ./node_modules/.bin/truffle exec --network development start.js; do
  >&2 echo "Node is unavailable - sleeping for One second"
  sleep 1
done

sleep 3

truffle migrate --network development --reset
