const FEBREST_ARGSLIST = '$FEBREST_ARGSLIST$';

const path = require('path')
function include(includes, src) {
    if (!includes) {
        return true;
    }
    for (let i = 0, l = includes.length; i < l; i++) {
        let p = new RegExp('^'+path.relative('./',includes[i]));

        if(p.test(src)){
            return true;
        }
    }
}
function makeVisitor(babel) {
    var types = babel.types;
    return {
        visitor: {
            FunctionDeclaration: {
                enter(path, state) {
                    let filename = state.file.opts.filename;
                    let opts = state.opts;
                    let includes = opts.include;
                    if(!include(includes,filename)){
                        console.log(filename)
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

                    path.insertAfter(types.assignmentExpression('=', left, right));
                }
            }
        }

    }
}

module.exports = makeVisitor;