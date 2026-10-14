import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'browser.spec.ts',fullyParallel:false,workers:1,
 use:{baseURL:'http://127.0.0.1:53100',headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||undefined,viewport:{width:1440,height:1080}},
 webServer:{command:'npm run preview -- --port 53100 --strictPort',url:'http://127.0.0.1:53100',reuseExistingServer:!process.env.CI},
 reporter:[['list'],['html',{open:'never'}]]
});
