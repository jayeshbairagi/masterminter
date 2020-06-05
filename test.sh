#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

ganache_port=8545

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  # We define 10 accounts with balance 1M ether, needed for high-value tests.
  local accounts=(
    --account="0xcd3d9f6592e22fcfff8c9f8bb0570d7b73bddee68dedfd1dbe6e12ba76a7e8f3,1000000000000000000000000"
    --account="0x93b7e0326651e4003ea45acb812b77b115dd0d2d2a6a7da2187a6e773ea58a32,1000000000000000000000000"
    --account="0x1567da9a7a781a76d5ffd831558895a9ad472c4a417ccf576bed845e383b783c,1000000000000000000000000"
    --account="0xc198c132387a3ee4798d91154d9e85647224473999239e6039b43f20ad80fc01,1000000000000000000000000"
    --account="0x91d140468a21ec7ec08884c1c271c1c8cacb1cba8aa3da006aebfbff1900aeff,1000000000000000000000000"
    --account="0x76c03ac3f25cfef28f07219f6de78224ff3ac4b69c56e971ebb4cd4489287a90,1000000000000000000000000"
    --account="0x2e6eb299a39cb58bbc8509e457aee008759191d6ed5128804643a200db723378,1000000000000000000000000"
    --account="0x5cc76dd0c20cdccf49cf90a5f84b49e9a49bd5a25b79dfe1d647a5b93baf0bd5,1000000000000000000000000"
    --account="0x5dd057f1c0c3bd0a503511aacc5f01340e461b32c79170a1558f84b0c5ca11ca,1000000000000000000000000"
    --account="0xcd5c174a410edd340eb70b400a2eee2caabe5cc283fd43891bb6e24a228cfc5c,1000000000000000000000000"
  )

  node_modules/.bin/ganache-cli --gasLimit 0xfffffffffff "${accounts[@]}" > /dev/null &

  ganache_pid=$!

  echo "Waiting for ganache to launch on port "$ganache_port"..."

  while ! ganache_running; do
    sleep 0.1 # wait for 1/10 of the second before check again
  done

  echo "Ganache launched!"
}

if ganache_running; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"
  start_ganache
fi

if [ "$SOLC_NIGHTLY" = true ]; then
  echo "Downloading solc nightly"
  wget -q https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/soljson-nightly.js -O /tmp/soljson.js && find . -name soljson.js -exec cp /tmp/soljson.js {} \;
fi

node_modules/.bin/truffle version

node_modules/.bin/truffle test --network test "$@"
