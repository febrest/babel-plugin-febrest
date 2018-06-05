const FEBREST_ARGSLIST = '$FEBREST_ARGSLIST$';

const path = require('path')
function include(includes, src) {
    if (!includes) {
        return true;
    }
    for (let i = 0, l = includes.length; i < l; i++) {
        let includePatch = includes[i];
       
        let p =  path.relative('./',includes[i]);

        if(src.indexOf(p)!==-1){
            return true;
        }
    }
}
function makeVisitor(babel) {
    var types = babel.types;
    return {
        visitor: {
            ClassMethod: function (path) {
                let node = path.node;
                if (node.static) {
                    return;
                }
                let methodName = node.key.name;
                if (methodName === 'getState') {
                    let params = parseParams(node.params, types);
                    let keyName=  FEBREST_GET_STATE_PROVIDER_DEPS;
                    let key = types.identifier(keyName);
                    let body = types.blockStatement([types.returnStatement(types.arrayExpression(params))]);
                    path.insertAfter(types.classMethod('method',key,[],body));
                }


            },
            FunctionDeclaration: {
                enter(path, state) {
                    let filename = state.file.opts.filename;
                    let opts = state.opts;
                    let includes = opts.include;

                    if(!include(includes,filename)){
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