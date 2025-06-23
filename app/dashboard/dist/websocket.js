"use strict";
exports.__esModule = true;
exports.closeWebSocket = exports.getWebSocket = exports.initializeWebSocket = exports.sendIdentify = void 0;
// websocket.ts
var toastFunc_1 = require("@/utils/toastFunc");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
// Singleton WebSocket instance and retry state
var ws_socket = null;
var retryCount = 0;
var maxRetries = 3;
var wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS || "ws://localhost:3000/ws";
exports.sendIdentify = function () {
    if (!ws_socket || ws_socket.readyState !== WebSocket.OPEN) {
        console.warn("Cannot send identify: socket not open");
        return;
    }
    var user = {};
    var adminUser = {};
    var isAdmin = false;
    try {
        user = localStorageFunc_1.GetItemFromLocalStorage("user") || {};
        adminUser = localStorageFunc_1.GetItemFromLocalStorage("adminUser") || {};
        if (typeof window !== "undefined") {
            isAdmin = window.location.pathname.startsWith("/admin");
        }
    }
    catch (err) {
        toastFunc_1.emitToastMessage("Failed to access user data.", "error");
    }
    var loggedInUser = isAdmin ? adminUser : user;
    var identifyMessage = {
        event: "identify",
        clientType: "web_app",
        userEmail: loggedInUser.email || null,
        isAdmin: isAdmin
    };
    ws_socket.send(JSON.stringify(identifyMessage));
};
exports.initializeWebSocket = function () {
    if (ws_socket) {
        if (ws_socket.readyState === WebSocket.OPEN) {
            console.log("WebSocket already open; re-sending identify");
            exports.sendIdentify();
            return ws_socket;
        }
        if (ws_socket.readyState === WebSocket.CONNECTING) {
            var prevOnOpen_1 = ws_socket.onopen;
            ws_socket.onopen = function (event) {
                if (prevOnOpen_1 && ws_socket)
                    prevOnOpen_1.call(ws_socket, event);
                exports.sendIdentify();
            };
            return ws_socket;
        }
    }
    if (!wsUrl) {
        console.error("WebSocket URL is undefined. Check .env configuration.");
        toastFunc_1.emitToastMessage("WebSocket URL is not configured.", "error");
        throw new Error("WebSocket URL is undefined");
    }
    try {
        ws_socket = new WebSocket(wsUrl);
        // Timeout if onopen doesn't fire
        var openTimeout_1 = setTimeout(function () {
            if (ws_socket && ws_socket.readyState !== WebSocket.OPEN) {
                ws_socket.close();
                ws_socket = null;
            }
        }, 5000);
        ws_socket.onopen = function () {
            clearTimeout(openTimeout_1);
            console.log("WebSocket connection established, readyState: " + (ws_socket === null || ws_socket === void 0 ? void 0 : ws_socket.readyState));
            retryCount = 0;
            exports.sendIdentify();
        };
        ws_socket.onclose = function (event) {
            console.log("WebSocket connection closed:", {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean
            });
            ws_socket = null;
            if (retryCount < maxRetries) {
                retryCount++;
                var delay = 5000 * retryCount;
                setTimeout(function () {
                    toastFunc_1.emitToastMessage("Retrying WebSocket connection (" + retryCount + "/" + maxRetries + ")...", "info");
                    exports.initializeWebSocket();
                }, delay);
            }
            else {
                toastFunc_1.emitToastMessage("Failed to establish WebSocket connection after multiple attempts.", "error");
            }
        };
        ws_socket.onerror = function (error) {
            toastFunc_1.emitToastMessage("WebSocket connection error occurred.", "error");
            ws_socket === null || ws_socket === void 0 ? void 0 : ws_socket.close();
            ws_socket = null;
        };
        return ws_socket;
    }
    catch (error) {
        ws_socket = null;
        toastFunc_1.emitToastMessage("Failed to create WebSocket connection.", "error");
        throw new Error("Failed to create WebSocket: " + error);
    }
};
// Return the singleton, initializing if needed
exports.getWebSocket = function () {
    var ws = ws_socket && ws_socket.readyState === WebSocket.OPEN
        ? ws_socket
        : exports.initializeWebSocket();
    if (!ws) {
        throw new Error("WebSocket is null");
    }
    return ws;
};
// Close and reset the singleton
exports.closeWebSocket = function () {
    if (ws_socket && ws_socket.readyState !== WebSocket.CLOSED) {
        ws_socket.close(1000, "Client requested close");
        ws_socket = null;
        retryCount = 0;
    }
};
