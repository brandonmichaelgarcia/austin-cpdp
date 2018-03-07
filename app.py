import os
from flask import Flask, render_template


app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])



@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')



if __name__ == '__main__':
    app.run()
