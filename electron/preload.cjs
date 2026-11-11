const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('benefitsDesktop', Object.freeze({ isDesktop: true, platform: process.platform }));
