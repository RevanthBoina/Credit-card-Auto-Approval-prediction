from flask import Flask, render_template, request

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Routes – backend logic will be added in a later phase.
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    """Home page."""
    return render_template("index.html")


@app.route("/about")
def about():
    """About page."""
    return render_template("about.html")


@app.route("/predict", methods=["GET", "POST"])
def predict():
    """
    GET  – render the prediction form.
    POST – receive form data and forward to the model (logic pending).
    """
    if request.method == "POST":
        # TODO: extract form fields, call model, redirect to result
        pass
    return render_template("predict.html")


@app.route("/result")
def result():
    """
    Display prediction result.
    Flask will inject {{ prediction }} and {{ probability }} via render_template.
    """
    # TODO: retrieve prediction data (e.g. from session or query params)
    return render_template("result.html")


@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(debug=True)
