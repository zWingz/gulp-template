const a = '123';
const test = 'test'
console.log(a, test)
const c = { b: 1 }
const { b } = c;

function format(a = 0, b = 0) {
    return a + b;
}

console.log(format(1, 2))

const bFnc = () => {
    console.log('b');
    console.log('b');
    console.log('1');
    console.log('b')
    console.log('b')
}

bFnc();
console.log('update test.js')
