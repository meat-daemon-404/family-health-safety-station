const tcb = require('@cloudbase/node-sdk');
console.log('version:', require('@cloudbase/node-sdk/package.json').version);
try {
  const app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV || '' });
  console.log('app created, ai type:', typeof app.ai);
  const ai = app.ai();
  console.log('ai object keys:', Object.keys(ai));
  console.log('createModel type:', typeof ai.createModel);
  const model = ai.createModel('cloudbase');
  console.log('model keys:', Object.keys(model));
  console.log('generateText type:', typeof model.generateText);
} catch (e) {
  console.log('ERROR:', e.message);
  console.log((e.stack||'').split('\n').slice(0,8).join('\n'));
}
