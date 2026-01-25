const document = {
    getElementById: (id) => ({
        value: '',
        classList: {
            contains: () => false,
            add: () => { },
            remove: () => { },
            toggle: () => { }
        }
    }),
    querySelectorAll: () => [],
    querySelector: () => ({ innerHTML: '' }),
    addEventListener: () => { }
};
const window = { location: { href: '' } };
const localStorage = { setItem: () => { } };
function alert(msg) { console.log('ALERT:', msg); }
