'use client';

import { useState } from 'react';
import { X, RotateCcw, Type, AlignLeft, Maximize, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReaderSettings } from '@/context/reader-settings-context';
import { SETTINGS_RANGES } from '@/types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useReaderSettings();
  const [activeTab, setActiveTab] = useState<'typography' | 'appearance'>('typography');

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          'fixed sm:sticky top-0 right-0 z-50 sm:z-auto',
          'h-full w-80 max-w-[85vw]',
          'bg-background border-l border-border',
          'flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'sm:translate-x-0',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="font-semibold">Settings</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={resetSettings}
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('typography')}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'typography'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Type className="h-4 w-4" />
              Typography
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'appearance'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Sun className="h-4 w-4" />
              Appearance
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'typography' && (
            <>
              {/* Font Size */}
              <SettingSection
                icon={<Type className="h-4 w-4" />}
                title="Font Size"
                description={`${settings.fontSize}px`}
              >
                <input
                  type="range"
                  min={SETTINGS_RANGES.fontSize.min}
                  max={SETTINGS_RANGES.fontSize.max}
                  step={SETTINGS_RANGES.fontSize.step}
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{SETTINGS_RANGES.fontSize.min}px</span>
                  <span>{SETTINGS_RANGES.fontSize.max}px</span>
                </div>
              </SettingSection>

              {/* Line Height */}
              <SettingSection
                icon={<AlignLeft className="h-4 w-4" />}
                title="Line Height"
                description={`${settings.lineHeight.toFixed(1)}`}
              >
                <input
                  type="range"
                  min={SETTINGS_RANGES.lineHeight.min}
                  max={SETTINGS_RANGES.lineHeight.max}
                  step={SETTINGS_RANGES.lineHeight.step}
                  value={settings.lineHeight}
                  onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{SETTINGS_RANGES.lineHeight.min}</span>
                  <span>{SETTINGS_RANGES.lineHeight.max}</span>
                </div>
              </SettingSection>

              {/* Max Width */}
              <SettingSection
                icon={<Maximize className="h-4 w-4" />}
                title="Reading Width"
                description={widthLabels[settings.maxWidth]}
              >
                <div className="flex gap-2">
                  {SETTINGS_RANGES.maxWidth.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => updateSettings({ maxWidth: option })}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                        settings.maxWidth === option
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {widthLabels[option]}
                    </button>
                  ))}
                </div>
              </SettingSection>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              {/* Theme */}
              <SettingSection
                icon={<Sun className="h-4 w-4" />}
                title="Theme"
              >
                <div className="grid grid-cols-3 gap-2">
                  <ThemeButton
                    active={settings.theme === 'light'}
                    onClick={() => updateSettings({ theme: 'light' })}
                    icon={<Sun className="h-4 w-4" />}
                    label="Light"
                  />
                  <ThemeButton
                    active={settings.theme === 'dark'}
                    onClick={() => updateSettings({ theme: 'dark' })}
                    icon={<Moon className="h-4 w-4" />}
                    label="Dark"
                  />
                  <ThemeButton
                    active={settings.theme === 'system'}
                    onClick={() => updateSettings({ theme: 'system' })}
                    icon={<Monitor className="h-4 w-4" />}
                    label="System"
                  />
                </div>
              </SettingSection>

              {/* Preview */}
              <SettingSection
                icon={<Type className="h-4 w-4" />}
                title="Preview"
              >
                <div
                  className="p-4 rounded-lg border bg-card"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight,
                    maxWidth: '100%',
                  }}
                >
                  <p className="font-serif">
                    The quick brown fox jumps over the lazy dog. This is how your book will look with the current settings.
                  </p>
                </div>
              </SettingSection>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

const widthLabels: Record<string, string> = {
  narrow: 'Narrow',
  medium: 'Medium',
  wide: 'Wide',
};

function SettingSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
