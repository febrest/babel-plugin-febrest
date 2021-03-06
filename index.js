const FEBREST_ARGSLIST = '$FEBREST_ARGSLIST$';
const FEBREST_INJECTION = '@providers';

const path = require('path');

function memberExpression(types, node) {
    let members = types.identifier(node[0]);
    for (let i = 1, l = node.length; i < l; i++) {
        members = types.memberExpression(members, types.identifier(node[i]));
    }
    return members;
}
function parseParams(params, types) {
    return params.map((node) => {
        let name;
        if (node.type === 'Identifier') {
            name = node.name;
        } else if (node.type === 'AssignmentPattern') {
            name = node.left.name;
        }
        return types.stringLiteral(name);
    });
}
function paramsToString(params) {
    let s = ''
    params.forEach((node) => {
        if (node.type === 'Identifier') {
            s += node.name + ',';
        } else if (node.type === 'AssignmentPattern') {
            s += node.left.name + ',';
        }
    });
    return s;
}
function addExpressionToFunction(node,types){
    let params = paramsToString(node.params);
    let body = node.body.body;
    body.unshift(toStringExpression(params, types));
}
function toStringExpression(params, types) {
    return types.expressionStatement(types.stringLiteral(FEBREST_INJECTION + '=[' + params + ']'))
}
function include(includes, src) {
    if (!includes) {
        return true;
    }
    for (let i = 0, l = includes.length; i < l; i++) {
        let includePatch = includes[i];

        let p = path.relative('./', includes[i]);

        if (src.indexOf(p) !== -1) {
            return true;
        }
    }
}
function makeVisitor(babel) {
    var types = babel.types;
    return {
        visitor: {
            ClassDeclaration: function (path) {
                let body = path.node.body.body;
                let name = path.node.id.name;
                if (!body) {
                    return;
                }
                for (let i = 0, l = body.length; i < l; i++) {
                    let node = body[i];
                    let methodName = node.key.name;

                    if (node.static) {
                        continue;
                    }
                    if (methodName === 'getState') {
                        let params = parseParams(node.params, types);
                        let getStateParamsExpression = types.arrayExpression(params);
                        let left = memberExpression(types, [name, 'prototype', 'getState', FEBREST_ARGSLIST]);
                        path.insertAfter(types.expressionStatement(types.assignmentExpression('=', left, getStateParamsExpression)));
                        addExpressionToFunction(node,types);
                        return;
                    }
                }
            },
            ObjectMethod: function (path) {
                let node = path.node;
                let name = node.key.name;
                if (name !== 'getState') {
                    return;
                }
                addExpressionToFunction(node,types);
            },
            ObjectProperty: function (path) {
                let node = path.node;
                let name = node.key.name;
                if (name !== 'getState') {
                    return;
                }
                if (node.value.type === 'FunctionExpression') {
                    node = node.value;
                    addExpressionToFunction(node,types);
                }

            },
            FunctionDeclaration: {
                enter(path, state) {
                    let filename = state.file.opts.filename;
                    let opts = state.opts;
                    let includes = opts.include;

                    if (!include(includes, filename)) {
                        return;
                    }

                    let params = path.node.params.map((node) => {
                        let name;
                        if (node.type === 'Identifier') {
                            name = node.name;
                        } else if (node.type === 'AssignmentPattern') {
                            name = node.left.name;
                        }
                        return types.stringLiteral(name);

                    })
                    let left = types.memberExpression(types.identifier(path.node.id.name), types.identifier(FEBREST_ARGSLIST))
                    let right = types.arrayExpression(params);

                    path.insertAfter(types.expressionStatement(types.assignmentExpression('=', left, right)));
                    addExpressionToFunction(path.node,types);
                }
            }
        }

    }
}

module.exports = makeVisitor;