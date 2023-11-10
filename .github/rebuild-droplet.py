from pydo import Client
import os
import time

client = Client(token=os.environ.get("DO_TOKEN"))
req = {
  "type": "restore",
  "image": os.environ.get("DO_IMAGE")
}

resp = client.droplet_actions.post(droplet_id=os.environ.get("DO_DROPLET_ID"), body=req)
time.sleep(60)
