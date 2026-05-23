import React from 'react';

interface IOSDeviceProps {
  children: React.ReactNode;
  dark?: boolean;
  keyboard?: boolean;
}

export const IOSStatusBar: React.FC<{ dark?: boolean; time?: string }> = ({ dark = false, time = '9:41' }) => {
  const c = dark ? '#fff' : '#000';
  return (
    <div className="flex gap-36 items-center justify-between px-6 pt-5 pb-4 relative z-50 w-full select-none">
      <div className="flex-1 h-5 flex items-center justify-center pt-0.5">
        <span className="font-sans font-semibold text-[15px] leading-none text-ink-light dark:text-bg-light" style={{ color: c }}>
          {time}
        </span>
      </div>
      <div className="flex-1 h-5 flex items-center justify-end gap-1.5 pt-0.5 pr-0.5">
        {/* Signal Bars */}
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="7" width="2.8" height="4" rx="0.5" fill={c}/>
          <rect x="4.2" y="5" width="2.8" height="6" rx="0.5" fill={c}/>
          <rect x="8.4" y="2.5" width="2.8" height="8.5" rx="0.5" fill={c}/>
          <rect x="12.6" y="0" width="2.8" height="11" rx="0.5" fill={c}/>
        </svg>
        {/* Wifi Icon */}
        <svg width="15" height="11" viewBox="0 0 15 11">
          <path d="M7.5 3C9.5 3 11.2 3.8 12.5 5.1L13.5 4.1C11.9 2.5 9.8 1.5 7.5 1.5C5.2 1.5 3.1 2.5 1.5 4.1L2.5 5.1C3.8 3.8 5.5 3 7.5 3Z" fill={c}/>
          <path d="M7.5 6.2C8.7 6.2 9.7 6.6 10.5 7.4L11.5 6.4C10.4 5.3 9.0 4.6 7.5 4.6C6.0 4.6 4.6 5.3 3.5 6.4L4.5 7.4C5.3 6.6 6.3 6.2 7.5 6.2Z" fill={c}/>
          <circle cx="7.5" cy="9.2" r="1.2" fill={c}/>
        </svg>
        {/* Battery Icon */}
        <svg width="24" height="12" viewBox="0 0 24 12">
          <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill={c}/>
          <path d="M22 4V8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

export const IOSKeyboard: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const glyphColor = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const suggestionColor = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBgColor = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  const icons = {
    shift: <svg width="19" height="17" viewBox="0 0 19 17"><path d="M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z" fill={glyphColor}/></svg>,
    del: <svg width="23" height="17" viewBox="0 0 23 17"><path d="M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z" fill="none" stroke={glyphColor} strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 5l7 7M17 5l-7 7" stroke={glyphColor} strokeWidth="1.6" strokeLinecap="round"/></svg>,
    ret: <svg width="20" height="14" viewBox="0 0 20 14"><path d="M18 1v6H4m0 0l4-4M4 7l4 4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };

  const renderKey = (content: React.ReactNode, options: { w?: number; flex?: boolean; ret?: boolean; fs?: number; k: string }) => (
    <div
      key={options.k}
      className={`h-[42px] rounded-[8.5px] shadow-sm flex items-center justify-center font-sans font-medium text-center select-none active:brightness-95 transition-all`}
      style={{
        width: options.w,
        flex: options.flex ? 1 : undefined,
        background: options.ret ? '#0088ff' : keyBgColor,
        fontSize: options.fs || 20,
        color: options.ret ? '#fff' : glyphColor,
      }}
    >
      {content}
    </div>
  );

  const renderRow = (keys: string[], pad = 0) => (
    <div className="flex gap-1.5 justify-center" style={{ padding: `0 ${pad}px` }}>
      {keys.map((l) => renderKey(l, { flex: true, k: l }))}
    </div>
  );

  return (
    <div className="relative z-15 select-none rounded-[27px] overflow-hidden pt-3 pb-1 flex flex-col items-center shadow-lg w-full">
      {/* Frosted liquid glass backdrop */}
      <div 
        className="absolute inset-0 rounded-[27px] backdrop-blur-xl saturate-150" 
        style={{ background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)' }}
      />
      <div className="absolute inset-0 rounded-[27px] border border-white/20 dark:border-white/10 pointer-events-none" />

      {/* Autocorrect Bar */}
      <div className="relative flex justify-between gap-5 items-center px-6 py-2.5 w-full box-border">
        {['"Busco"', 'hombre', 'mujer'].map((w, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <div className="w-[0.5px] h-6 bg-ink/10 dark:bg-white/10" />}
            <span 
              className="flex-1 text-center font-sans text-[15.5px] leading-tight tracking-tight"
              style={{ color: suggestionColor }}
            >
              {w}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Primary Keypad Grid */}
      <div className="relative flex flex-col gap-3 px-1.5 w-full box-border">
        {renderRow(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'])}
        {renderRow(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 12)}
        
        <div className="flex gap-2 items-center justify-between">
          {renderKey(icons.shift, { w: 42, k: 'shift' })}
          <div className="flex gap-1.5 flex-1 min-w-0">
            {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((l) => renderKey(l, { flex: true, k: l }))}
          </div>
          {renderKey(icons.del, { w: 42, k: 'del' })}
        </div>

        <div className="flex gap-1.5 items-center w-full">
          {renderKey('123', { w: 90, fs: 15, k: 'abc' })}
          {renderKey('', { flex: true, k: 'space' })}
          {renderKey(icons.ret, { w: 90, ret: true, k: 'ret' })}
        </div>
      </div>

      {/* Mic/Emoji Bottom Spacer */}
      <div className="h-10 w-full relative" />
    </div>
  );
};

export const IOSDevice: React.FC<IOSDeviceProps> = ({
  children,
  dark = false,
  keyboard = false,
}) => {
  return (
    <div
      className={`relative w-[402px] h-[874px] rounded-[48px] overflow-hidden border shadow-2xl flex flex-col select-none ${
        dark ? 'bg-black border-white/10' : 'bg-[#F2F2F7] border-black/10'
      }`}
    >
      {/* iPhone Dynamic Island */}
      <div className="absolute top-[11px] left-1/2 translate-x-[-50%] w-[126px] h-[37px] rounded-[24px] bg-black z-50 pointer-events-none" />

      {/* iPhone Status Bar */}
      <div className="absolute top-0 inset-x-0 z-40 pointer-events-none">
        <IOSStatusBar dark={dark} />
      </div>

      {/* App Body Content Container */}
      <div className="flex-1 overflow-hidden relative flex flex-col pt-12">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {/* Virtual Keyboard Overlay */}
        {keyboard && (
          <div className="absolute bottom-0 inset-x-0 z-30">
            <IOSKeyboard dark={dark} />
          </div>
        )}
      </div>

      {/* Home Indicator line */}
      <div className="absolute bottom-0 inset-x-0 z-40 h-[34px] flex items-end justify-center pb-2 pointer-events-none">
        <div 
          className="w-[139px] h-[5px] rounded-full" 
          style={{ background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)' }}
        />
      </div>
    </div>
  );
};
export default IOSDevice;
