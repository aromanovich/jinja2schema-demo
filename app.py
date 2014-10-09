import flask
import jinja2
import jinja2schema


app = flask.Flask(__name__)


class CustomJSONSchemaEncoder(jinja2schema.JSONSchemaDraft4Encoder):
    def encode(self, var):
        if isinstance(var, jinja2schema.model.Unknown) or type(var) is jinja2schema.model.Scalar:
            rv = self.encode_common_attrs(var)
            rv['type'] = 'string'
        else:
            rv = super(CustomJSONSchemaEncoder, self).encode(var)
        return rv


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/schema/', methods=('POST',))
def schema():
    template = flask.request.get_data()
    try:
        config = jinja2schema.Config()
        config.CONSIDER_CONDITIONS_AS_BOOLEAN = True
        struct = jinja2schema.infer(template, config)
    except jinja2schema.InferException as e:
        return flask.jsonify({
            'message': u'jinj2schema error: {}'.format(e),
        }), 400
    except jinja2.TemplateSyntaxError as e:
        return flask.jsonify({
            'message': u'Jinja2 error: {}, line {}'.format(e.message, e.lineno),
        }), 400
    else:
        json_schema = jinja2schema.to_json_schema(struct, jsonschema_encoder=CustomJSONSchemaEncoder)
        return flask.jsonify({
            'schema': json_schema,
        })


@app.route('/jinja2schema-version/')
def jinja2schema_version():
    return flask.jsonify({
        'version': jinja2schema.__version__,
    })


if __name__ == '__main__':
    app.config.update(DEBUG=True)
    app.run()
