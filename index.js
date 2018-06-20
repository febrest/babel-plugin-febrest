const FEBREST_ARGSLIST = '$FEBREST_ARGSLIST$';

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
                if(!body){
                    return;
                }
                for(let i = 0,l=body.length;i<l;i++){
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
                        return;
                    }
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
                }
            }
        }

    }
}

module.exports = makeVisitor;