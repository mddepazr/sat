import base from './playwright.config.js';
export default {
  ...base,
  testIgnore: [],
  testMatch: '**/responsive.spec.js',
  reporter: [['list'],['json',{outputFile:'evidencias/responsive-playwright.json'}]],
  projects: [
    {name:'320x740',use:{viewport:{width:320,height:740},isMobile:true,hasTouch:true}},
    {name:'390x844',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
    {name:'768x1024',use:{viewport:{width:768,height:1024},isMobile:true,hasTouch:true}},
    {name:'1024x768',use:{viewport:{width:1024,height:768},isMobile:false,hasTouch:true}},
    {name:'1440x900',use:{viewport:{width:1440,height:900},isMobile:false,hasTouch:false}},
    {name:'844x390-horizontal',use:{viewport:{width:844,height:390},isMobile:true,hasTouch:true}},
  ],
};
