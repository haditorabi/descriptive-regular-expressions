const REInstance = require('../DescriptiveRE');

function resetLastIndex(regex) {
    regex.lastIndex = 0;
}

test('constructor', () => {
    const testRegex = new REInstance();
    
    expect(testRegex instanceof RegExp).toBeTruthy();
    expect(testRegex.toString()).toBe('/(?:)/gm');
});


test('sanitize', () => {
    const testRegex = new REInstance();

    const testString = '$a^b\\c|d(e)f[g]h{i}j.k*l+m?n:o=p';
    const escaped = '\\$a\\^b\\\\c\\|d\\(e\\)f\\[g\\]h\\{i\\}j\\.k\\*l\\+m\\?n\\:o\\=p';

    expect(testRegex.sanitize(testString)).toBe(escaped);
    expect(testRegex.sanitize(42)).toBe(42);
    expect(testRegex.sanitize(/foo/)).toBe("foo");
    expect(testRegex.sanitize()).toBe("");
});

test('add', () => {
    let testRegex = new REInstance().startOfLine().withAnyCase().endOfLine();
    testRegex = testRegex.add('(?:foo)?');

    expect(testRegex.source.startsWith('^')).toBeTruthy();
    expect(testRegex.source.endsWith('$')).toBeTruthy();
    expect(testRegex.test('foo')).toBeTruthy();
    resetLastIndex(testRegex);
    expect(testRegex.test('')).toBeTruthy();
    expect(testRegex.flags).toMatch("i");
});

// // Rules //

test('startOfLine', () => {
    let testRegex = new REInstance().startOfLine().then('a');
    let testString = 'a';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'ba';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = new REInstance().startOfLine(false); // start of line is no longer necessary
    testString = 'ba';
    expect(testRegex.test(testString)).toBeTruthy();
});

test('endOfLine', () => {
    let testRegex = new REInstance().find('a').endOfLine();
    let testString = 'a';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'ab';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.endOfLine(false);
    testString = 'ab';
    expect(testRegex.test(testString)).toBeTruthy();
});

function then(name) {
    let RE = new REInstance();
    let testRegex = RE[name]('a');
    let testString = 'a';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'b';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = '';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex[name]('a')[name]('b');
    testString = 'ab';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'ac';
    expect(testRegex.test(testString)).toBeFalsy();
}

test('then', () => {
    then('then');
});

test('find', () => {
    then('find');
});

test('maybe', () => {
    const testRegex = new REInstance().startOfLine().then('a').maybe('b');
    let testString = 'acb';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'abc';
    expect(testRegex.test(testString)).toBeTruthy();
});

test('or', () => {
    let testRegex = new REInstance().startOfLine().then('abc').or('def');
    let testString = 'defzzz';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'abczzz';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'xyzabc';
    expect(testRegex.test(testString)).toBeFalsy();
    
    resetLastIndex(testRegex);
    testString = 'abczzz';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'xyzabc';
    expect(testRegex.test(testString)).toBeFalsy();
});

test('anything', () => {
    const testRegex = new REInstance().startOfLine().anything();
    let testString = 'foo';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = '';
    expect(testRegex.test(testString)).toBeTruthy();
});

test('anythingNot', () => {
    let testRegex = new REInstance().startOfLine().anythingNot('br').endOfLine();
    let testString = 'foobar';

    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'foo_a_';
    expect(testRegex.test(testString)).toBeTruthy();

    testRegex = testRegex.startOfLine().anythingNot('br');
    testString = 'bar';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().anythingNot(['b', 'r']).endOfLine();
    testString = 'foobar';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'foo_a_';
    expect(testRegex.test(testString)).toBeTruthy();

    testRegex = testRegex.startOfLine().anythingNot(['b', 'r']);
    testString = 'bar';
    expect(testRegex.test(testString)).toBeFalsy();
});

test('something', () => {
    const testRegex = new REInstance().something();
    let testString = '';

    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'a';
    expect(testRegex.test(testString)).toBeTruthy();
});

test('somethingNot', () => {
    let testRegex = new REInstance().startOfLine().somethingNot('abc').endOfLine();
    let testString = '';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'foo';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'fab';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().somethingNot(['a', 'b', 'c']).endOfLine();
    testString = '';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'foo';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'fab';
    expect(testRegex.test(testString)).toBeFalsy();
});

function anyOf(name) {
    let testRegex = new REInstance().startOfLine().then('a')[name]('xyz');
    let testString = 'ay';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'ab';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'a';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().then('a')[name](['x', 'y', 'z']);
    testString = 'ay';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'ab';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'a';
    expect(testRegex.test(testString)).toBeFalsy();
}

