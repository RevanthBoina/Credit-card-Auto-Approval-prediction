# models/

Place your trained pipeline here:

```
web/models/final_credit_model_pipeline.pkl
```

## How to download from Colab

Run this cell in your Colab notebook:

```python
from google.colab import files
files.download('/content/project/models/final_credit_model_pipeline.pkl')
```

Then move the downloaded file into this directory before running the Flask app.

> **Note:** The `.pkl` file is excluded from git via `.gitignore` because it can
> be large. Regenerate it from the training notebook whenever needed.
