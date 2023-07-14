from pydo import Client
import os
import time

client = Client(token=os.environ.get("DO_TOKEN"))
req = {
  "type": "restore",
  "image": 136502792
}

resp = client.droplet_actions.post(droplet_id=365187067, body=req)
time.sleep(30)
