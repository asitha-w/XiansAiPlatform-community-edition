#!/bin/bash

# Elasticsearch setup script for Temporal visibility
# This script sets up the required Elasticsearch index and template for Temporal

set -e

ES_HOST=${ES_HOST:-localhost}
ES_PORT=${ES_PORT:-9200}
ES_URL="http://${ES_HOST}:${ES_PORT}"
INDEX_NAME=${ES_VIS_INDEX:-temporal_visibility_v1_dev}
TEMPLATE_NAME="temporal_visibility_v1_template"

echo "Setting up Elasticsearch for Temporal visibility..."
echo "Elasticsearch URL: $ES_URL"
echo "Index name: $INDEX_NAME"

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch to be ready..."
until curl -s "$ES_URL/_cluster/health" > /dev/null; do
    echo "Waiting for Elasticsearch..."
    sleep 2
done

echo "Elasticsearch is ready!"

# Create index template
echo "Creating index template..."
curl -X PUT "$ES_URL/_template/$TEMPLATE_NAME" \
  -H 'Content-Type: application/json' \
  -d '{
    "index_patterns": ["temporal_visibility_v1_*"],
    "settings": {
      "index": {
        "number_of_shards": 1,
        "number_of_replicas": 0
      }
    },
    "mappings": {
      "properties": {
        "VisibilityTaskKey": {
          "type": "keyword"
        },
        "RunId": {
          "type": "keyword"
        },
        "WorkflowId": {
          "type": "keyword"
        },
        "WorkflowType": {
          "type": "keyword"
        },
        "StartTime": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "ExecutionTime": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "CloseTime": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "ExecutionStatus": {
          "type": "keyword"
        },
        "TaskQueue": {
          "type": "keyword"
        },
        "HistoryLength": {
          "type": "long"
        },
        "Encoding": {
          "type": "keyword"
        },
        "KnownEncoding": {
          "type": "keyword"
        },
        "Memo": {
          "type": "object",
          "enabled": false
        },
        "SearchAttributes": {
          "type": "object",
          "dynamic": true
        }
      }
    }
  }'

echo ""
echo "Index template created successfully!"

# Create the index (if it doesn't exist)
echo "Creating index: $INDEX_NAME"
response=$(curl -s -X PUT "$ES_URL/$INDEX_NAME" \
  -H 'Content-Type: application/json' \
  -d '{
    "settings": {
      "index": {
        "number_of_shards": 1,
        "number_of_replicas": 0
      }
    }
  }')

echo ""
if echo "$response" | grep -q "resource_already_exists_exception"; then
    echo "✅ Index already exists (skipping creation)"
elif echo "$response" | grep -q "acknowledged.*true"; then
    echo "✅ Index created successfully!"
else
    echo "⚠️  Index creation response: $response"
fi

# Verify setup
echo "Verifying setup..."
curl -s "$ES_URL/$INDEX_NAME/_mapping" | python3 -m json.tool

echo ""
echo "Elasticsearch setup completed successfully!"
echo "You can now start Temporal with Elasticsearch visibility enabled."
