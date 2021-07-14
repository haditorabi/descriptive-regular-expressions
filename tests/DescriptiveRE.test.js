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

    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'ab';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'a';
    expect(testRegex.test(testString)).toBeFalsy();
}

test('anyOf', () => {
    anyOf('anyOf');
});

test('any', () => {
    anyOf('any');
});

test('not', () => {
    const testRegex = new REInstance().startOfLine().not('foo').anything().endOfLine();
    let testString = 'foobar';

    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'bar';
    expect(testRegex.test(testString)).toBeTruthy();
});

test('range', () => {
    let testRegex = new REInstance().startOfLine().range('a', 'z', '0', '9').oneOrMore().endOfLine();
    let testString = 'foobarbaz123';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'fooBarBaz_123';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().range('a', 'z', '0').oneOrMore().endOfLine();
    testString = 'foobarbaz';
    expect(testRegex.test(testString)).toBeTruthy;

    resetLastIndex(testRegex);
    testString = 'foobarbaz123';
    expect(testRegex.test(testString)).toBeFalsy();
});

// // Special characters //

function lineBreak(name) {
    const testRegex = new REInstance().startOfLine().then('abc')[name]().then('def');
    let testString = 'abc\r\ndef';

    expect(testRegex.test(testString)).toBeTruthy;

    resetLastIndex(testRegex);
    testString = 'abc\ndef';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'abc\rdef';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'abc\r\n\ndef';
    expect(testRegex.test(testString)).toBeFalsy();
}

test('lineBreak', () => {
    lineBreak('lineBreak');
});

test('br', () => {
    lineBreak('br');
});

test('tab', () => {
    const testRegex = new REInstance().startOfLine().tab().then('abc');
    let testString = '\tabc';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'abc';
    expect(testRegex.test(testString)).toBeFalsy();
});

test('word', () => {
    let testRegex = new REInstance().startOfLine().word().endOfLine();
    let testString = 'azertyuiopqsdfghjklmwxcvbn0123456789_';

    expect(testRegex.test(testString)).toBeTruthy();

    testRegex = testRegex.word();
    testString = '. @[]|,&~-';
    expect(testRegex.test(testString)).toBeFalsy();
});

test('digit', () => {
    let testRegex = new REInstance().startOfLine().digit().oneOrMore().endOfLine();
    let testString = '0123456789';

    expect(testRegex.test(testString)).toBeTruthy;

    testRegex = testRegex.digit();
    testString = '-.azertyuiopqsdfghjklmwxcvbn @[]|,_&~';
    expect(testRegex.test(testString)).toBeFalsy();
});

test('whitespace', () => {
    const testRegex = new REInstance().startOfLine().whitespace().oneOrMore().searchOneLine().endOfLine();
    let testString = ' \t\r\n\v\f';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'a z';
    expect(testRegex.test(testString)).toBeFalsy();
});

// // Modifiers //

test('addModifier', () => {
    let testRegex = new REInstance().addModifier('y');
    expect(testRegex.flags.includes('y')).toBeTruthy();
});

test('removeModifier', () => {
    const testRegex = new REInstance().removeModifier('g');
    expect(testRegex.flags.includes('g')).toBeFalsy();
});

test('withAnyCase', () => {
    let testRegex = new REInstance().startOfLine().then('a');
    let testString = 'A';

    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().then('a').withAnyCase();
    testString = 'A';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'a';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().then('a').withAnyCase(false);
    testString = 'A';
    expect(testRegex.test(testString)).toBeFalsy();
});

test('stopAtFirst', () => {
    let testRegex = new REInstance().find('foo');
    const testString = 'foofoofoo';

    expect(testString.match(testRegex).length).toBe(3);

    testRegex = testRegex.find('foo').stopAtFirst();
    expect(testString.match(testRegex).length).toBe(1);

    testRegex = testRegex.find('foo').stopAtFirst(false);
    expect(testString.match(testRegex).length).toBe(1);
});

test('searchOneLine', () => {
    let testRegex = new REInstance().startOfLine().then('b').endOfLine();
    const testString = 'a\nb\nc';

    expect(testRegex.test(testString)).toBeTruthy();

    testRegex = testRegex.startOfLine().then('b').endOfLine().searchOneLine();
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().then('b').endOfLine().searchOneLine(false);
    expect(testRegex.test(testString)).toBeFalsy();
});

// // Loops //

test('repeatPrevious', () => {
    let testRegex = new REInstance().startOfLine().find('foo').repeatPrevious(3).endOfLine();
    let testString = 'foofoofoo';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'foofoo';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'foofoofoofoo';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'bar';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().find('foo').repeatPrevious(1, 3).endOfLine();

    for (let i = 0; i <= 4; i++) {
        resetLastIndex(testRegex);
        testString = 'foo'.repeat(i);

        if (i < 1 || i > 3) {
            // expect(testRegex.test(testString)).toBeFalsy();
        } else {
            // expect(testRegex.test(testString)).toBeTruthy();
        }
    }

    testRegex = testRegex.startOfLine().find('foo').repeatPrevious().endOfLine();
    testString = 'foofoo';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().find('foo').repeatPrevious(1, 2, 3).endOfLine();
    testString = 'foofoo';
    expect(testRegex.test(testString)).toBeFalsy();
});

test('oneOrMore', () => {
    const testRegex = new REInstance().startOfLine().then('foo').oneOrMore().endOfLine();
    let testString = 'foo';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'foofoo';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'bar';
    expect(testRegex.test(testString)).toBeFalsy();
});

test('multiple', () => {
    let testRegex = new REInstance().startOfLine().find(' ').multiple().endOfLine();
    let testString = '   ';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = ' a ';
    expect(testRegex.test(testString)).toBeFalsy();

    testRegex = testRegex.startOfLine().multiple('foo').endOfLine();
    testString = 'foo';

    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'foofoofoo';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = '';
    expect(testRegex.test(testString)).toBeTruthy();

    testRegex = testRegex.startOfLine().multiple('foo', 2).endOfLine();
    testString = 'foo';
    expect(testRegex.test(testString)).toBeFalsy();

    resetLastIndex(testRegex);
    testString = 'foofoo';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    testString = 'foofoofoo';
    expect(testRegex.test(testString)).toBeTruthy();

    testRegex = testRegex.startOfLine().multiple('foo', 2, 5).endOfLine();

    for (let i = 0; i <= 6; i++) {
        resetLastIndex(testRegex);
        testString = 'foo'.repeat(i);

        if (i < 2 || i > 5) {
            // expect(testRegex.test(testString)).toBeFalsy();
        } else {
            // expect(testRegex.test(testString)).toBeTruthy();
        }
    }
});

// // Capture groups //

test('capture groups', () => {
    let testRegex = new REInstance().find('foo').beginCapture().then('bar');
    let testString = 'foobar';

    expect(testRegex.test(testString)).toBeTruthy();

    testRegex = testRegex.endCapture().then('baz');
    testString = 'foobarbaz';
    expect(testRegex.test(testString)).toBeTruthy();

    resetLastIndex(testRegex);
    const matches = testRegex.exec(testString);
    expect(matches[1]).toBe('bar');
});

// // Miscellaneous //

test('replace', () => {
    const testRegex = new REInstance().find(' ');
    const testString = 'foo bar baz';

    expect(testRegex.replace(testString, '_')).toBe('foo_bar_baz');
});

test('toRegExp', () => {
    const testRegex = new REInstance().anything();
    const converted = testRegex.toRegExp();

    expect(converted.toString()).toBe(testRegex.toString());
});
