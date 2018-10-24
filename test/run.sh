#!/bin/bash
#
# jsonline-processor tests
#
set -e

tempfile=$(mktemp /tmp/jls_result.XXXXXXXXX)

cd ${0%/*}

node ../index.js v0_1.js < sample.log > $tempfile
diff $tempfile v0_1_expected.log

node ../index.js v0_2.js sample.tsv < sample.log > $tempfile
diff $tempfile v0_2_expected.log

rm $tempfile
echo "Test succeeded"
