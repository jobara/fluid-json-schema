/*

    This file defines the core concept of a "schema holder", a grades that holds a schema that can be used to validate
    arbitrary user payloads.  It also provides the core "user" schema extended by the specific schemas used by
    the REST API endpoints in this package.

*/
/* globals require */
fluid = fluid || require("infusion");

(function (fluid) {
    "use strict";
    if (fluid.require) {
        fluid.require("%fluid-json-schema");
    }

    fluid.registerNamespace("fluid.schema.schemaHolder");

    fluid.schema.schemaHolder.generateIfNeeded = function (that) {
        return that.generatedSchema ? fluid.toPromise(that.generatedSchema) : that.generateSchema();
    };

    // We cannot simply use fluid.set here because it does not return the set value, and would strip the value from the
    // promise chain.
    fluid.schema.schemaHolder.cacheSchema = function (that, schema) {
        that.generatedSchema = schema;
        return schema;
    };

    fluid.schema.schemaHolder.incorporateSubcomponentSchemas = function (parentSchemaHolder, originalSchema) {
        return originalSchema;
    };

    fluid.defaults("fluid.schema.schemaHolder", {
        gradeNames: ["fluid.component"],
        events: {
            onGenerateSchema: null
        },
        members: {
            generatedSchema: false
        },
        schema: {
            $schema: "fss-v7-full#",
            additionalProperties: true
        },
        invokers: {
            getChildSchemaHolders: {
                funcName: "fluid.queryIoCSelector",
                args: ["{that}", "fluid.schema.schemaHolder", true]
            },
            getSchema: {
                funcName: "fluid.schema.schemaHolder.generateIfNeeded",
                args: ["{that}"]
            },
            generateSchema: {
                funcName: "fluid.promise.fireTransformEvent",
                args: ["{that}.events.onGenerateSchema"]
            },
            incorporateSubcomponentSchemas: {
                funcName: "fluid.schema.schemaHolder.incorporateSubcomponentSchemas",
                args: ["{that}", "{arguments}.0"] // parentSchemaHolder, schemaToDate
            }
        },
        listeners: {
            "onGenerateSchema.getOptions": {
                priority: "first",
                funcName: "fluid.identity",
                args: ["{that}.options.schema"]
            },
            "onGenerateSchema.incorporateComponentSchemas": {
                priority: "after:getOptions",
                func: "{that}.incorporateSubcomponentSchemas",
                args: ["{arguments}.0"]
            },
            "onGenerateSchema.cacheSchema": {
                priority: "last",
                funcName: "fluid.schema.schemaHolder.cacheSchema",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });
})(fluid);
