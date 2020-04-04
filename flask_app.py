from flask import Flask,render_template,redirect,request,jsonify
from Caption_generation import get_caption
import os

#__name__ == __main__
app = Flask(__name__)

@app.route("/api",methods=["POST"])
def marks():
    if request.method=="POST":
        f = request.files["file"]
        print(f.filename)
        path="./static/" + f.filename
        f.save(path)
        caption = get_caption(path)
        os.remove(path)
        return jsonify(caption)


if __name__ == "__main__":
	app.run(threaded=False)
