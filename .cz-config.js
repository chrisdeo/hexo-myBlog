module.exports = {
    types: [
        { value: '<feat>', name: '新功能:     新的需求展开' },
        { value: '<fix>', name: 'Bug修复:      对测试缺陷的修复' },
        { value: '<docs>', name: '文档更迭:     文档修改的' },
        { value: '<format>', name: '格式化:     如结尾的分号处理，不影响现有代码逻辑' },
        { value: '<refactor>', name: '代码重构:     提升代码的可阅读、复用、拓展性。该修改不会增加新特性和修复BUG' },
        { value: '<perf>', name: '性能优化:     本次提交进行了性能上的调优' },
        { value: '<test>', name: '测试用例:     补充测试用例' },
        { value: '<chore>', name: '工程化更迭:     工程化上的方案调整，如webpack升级，新依赖包的引入，使用文档的更新' },
        { value: '<revert>', name: '代码回退:   本次提交代表代码回退' },
        { value: '<WIP>', name: '开发中:      本次提交内容仍处在开发过程中' },
    ],

    scopes: [{ name: 'accounts' }, { name: 'admin' }, { name: 'exampleScope' }, { name: 'changeMe' }],

    allowTicketNumber: false,
    isTicketNumberRequired: false,
    ticketNumberPrefix: 'TICKET-',
    ticketNumberRegExp: '\\d{1,5}',

    // it needs to match the value for field type. Eg.: 'fix'
    /*
    scopeOverrides: {
      fix: [
        {name: 'merge'},
        {name: 'style'},
        {name: 'e2eTest'},
        {name: 'unitTest'}
      ]
    },
    */
    // override the messages, defaults are as follows
    messages: {
        type: "Select the type of change that you're committing:",
        scope: '\nDenote the SCOPE of this change (optional):',
        // used if allowCustomScopes is true
        customScope: 'Denote the SCOPE of this change:',
        subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
        body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
        breaking: 'List any BREAKING CHANGES (optional):\n',
        footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
        confirmCommit: 'Are you sure you want to proceed with the commit above?',
    },

    allowCustomScopes: true,
    allowBreakingChanges: ['feat', 'fix'],
    // skip any questions you want
    skipQuestions: ['body'],

    // limit subject length
    subjectLimit: 100,
    // breaklineChar: '|', // It is supported for fields body and footer.
    // footerPrefix : 'ISSUES CLOSED:'
    // askForBreakingChangeFirst : true, // default is false
};