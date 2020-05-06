
from __future__ import print_function

import os
import sys
import requests
from redisearch import Client, TextField
from urlparse import urlparse
from flask import Flask, jsonify, json, Response, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# The service basepath has a short response just to ensure that healthchecks
# sent to the service root will receive a healthy response.
@app.route("/")
def health_check_response():
    return jsonify({"message" : "Nothing here, used for health check."})

def store_in_search(mysfit_id):
# Creating a client with a given index name
	client = Client('myIndex', host='redis', port=6379)

# Creating the index definition and schema
	client.create_index((TextField('title', weight=5.0), TextField('body')))

# Indexing a document
	client.add_document('doc1', title = 'RediSearch', body = 'Redisearch impements a search engine on top of redis')

# Simple search
	res = client.search("search engine")

# Searching with snippets
	res = client.search("search engine", snippet_sizes = {'body': 50})

# Searching with complext parameters:
	q = Query("search engine").verbatim().no_content().with_scores().paging(0,5)
	res = client.search(q)


# the result has the total number of results, and a list of documents
	print res.total # "1"
	print res.docs[0].title 


@app.route("/mysfits/<mysfit_id>/like", methods=['POST'])
def like_mysfit(mysfit_id):
    process_like_request()
    service_response = fulfill_like(mysfit_id)

    flask_response = Response(service_response)
    flask_response.headers["Content-Type"] = "application/json"

    return flask_response

# Run the service on the local server it has been deployed to,
# listening on port 8080.
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
