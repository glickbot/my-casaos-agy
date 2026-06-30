import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';
import { Copy } from 'lucide-react';

const TerminalComponent = ({ workspaceName, sessionType = 'agy' }) => {
  const terminalRef = useRef(null);
  const term = useRef(null);
  const socket = useRef(null);
  const fitAddon = useRef(null);

  useEffect(() => {
    // Initialize xterm
    term.current = new Terminal({
      cursorBlink: true,
      fontFamily: '"Fira Code", "JetBrains Mono", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#f5c2e7',
        cyan: '#94e2d5',
        white: '#bac2de',
        brightBlack: '#585b70',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#f5c2e7',
        brightCyan: '#94e2d5',
        brightWhite: '#a6adc8',
      }
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);
    term.current.open(terminalRef.current);
    fitAddon.current.fit();

    // Connect Socket.io
    // Since we will serve from the backend directly in prod, we can use the current host.
    // In dev, point to port 3000.
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '/';
    socket.current = io(socketUrl);

    socket.current.on('connect', () => {
      socket.current.emit('start_session', { workspaceName, sessionType });
      fitAddon.current.fit();
      socket.current.emit('resize', { cols: term.current.cols, rows: term.current.rows });
    });

    socket.current.on('output', (data) => {
      term.current.write(data);
    });

    term.current.onData((data) => {
      socket.current.emit('input', data);
    });

    const handleResize = () => {
      if (fitAddon.current && term.current && socket.current) {
        fitAddon.current.fit();
        socket.current.emit('resize', { cols: term.current.cols, rows: term.current.rows });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.current.disconnect();
      term.current.dispose();
    };
  }, [workspaceName]);

  const copyOutput = () => {
    if (term.current) {
      // Very basic approach to select all text in the buffer and copy
      const buffer = term.current.buffer.active;
      let output = '';
      for (let i = 0; i < buffer.length; i++) {
        output += buffer.getLine(i)?.translateToString(true) + '\\n';
      }
      navigator.clipboard.writeText(output).then(() => alert("Terminal output copied!"));
    }
  };

  return (
    <div className="relative w-full h-full p-2 bg-casa-dark rounded-xl border border-white/10 shadow-inner flex flex-col">
      <div className="flex justify-end mb-2">
        <button 
          onClick={copyOutput} 
          className="glass-button text-xs px-3 py-1 text-casa-light/80 hover:text-white"
          title="Copy Output"
        >
          <Copy size={14} /> Copy All
        </button>
      </div>
      <div className="flex-1 overflow-hidden" ref={terminalRef} />
    </div>
  );
};

export default TerminalComponent;
