import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, RotateCcw, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRealizationColorStore } from '../state/state-management';
import { RealizationColorUtils } from '../utils/realization-color-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface RealizationColorCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  realizationCode: string;
  currentEventTitle: string;
}

export const RealizationColorCustomizer = ({ 
  open, 
  onOpenChange, 
  realizationCode,
  currentEventTitle 
}: RealizationColorCustomizerProps) => {
  const { t } = useTranslation('colorCustomization');
  const { customColors, setRealizationColor, resetRealizationColor, hasCustomColor } = useRealizationColorStore();
  
  const [tempColor, setTempColor] = useState<string>('');
  const [colorInputType, setColorInputType] = useState<'hex' | 'rgb'>('hex');

  const effectiveColor = RealizationColorUtils.getEffectiveColor(realizationCode, customColors);
  const isCustomized = hasCustomColor(realizationCode);

  const handleColorChange = (color: string) => {
    let rgbColor: string | null = null;
    
    if (colorInputType === 'hex') {
      rgbColor = RealizationColorUtils.hexToRgb(color);
    } else {
      rgbColor = RealizationColorUtils.isValidRgbColor(color) ? color : null;
    }
    
    if (rgbColor) {
      setTempColor(rgbColor);
    }
  };

  const handleApply = () => {
    if (tempColor && RealizationColorUtils.isValidRgbColor(tempColor)) {
      setRealizationColor(realizationCode, tempColor);
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    resetRealizationColor(realizationCode);
    setTempColor('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempColor('');
    onOpenChange(false);
  };

  // Convert current effective color to hex for the color input
  const currentHexColor = RealizationColorUtils.rgbToHex(effectiveColor) || '#3B82F6';
  
  const previewColorPair = RealizationColorUtils.getEffectiveColorPair(realizationCode, {
    ...customColors,
    ...(tempColor ? { [realizationCode]: tempColor } : {})
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)'
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Palette className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            {t('dialog.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Event Info */}
          <div className="p-3 rounded-lg border" style={{
            backgroundColor: 'var(--color-surface-secondary)',
            borderColor: 'var(--color-border)'
          }}>
            <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
              {currentEventTitle}
            </h4>
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {t('dialog.colorPreviewLabel')}
            </label>
            <div className="relative">
              <motion.div
                className="h-16 rounded-lg shadow-sm"
                style={{
                  background: previewColorPair.normal,
                }}
                whileHover={{
                  background: previewColorPair.flipped
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-white font-medium text-sm">
                    {t('dialog.sampleEventText', { code: realizationCode })}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Color Input Type Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setColorInputType('hex')}
              variant={colorInputType === 'hex' ? 'default' : 'outline'}
              size="sm"
            >
              {t('dialog.buttons.hex')}
            </Button>
            <Button
              onClick={() => setColorInputType('rgb')}
              variant={colorInputType === 'rgb' ? 'default' : 'outline'}
              size="sm"
            >
              {t('dialog.buttons.rgb')}
            </Button>
          </div>

          {/* Color Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {colorInputType === 'hex' ? t('dialog.colorInputTypeLabel.hex') : t('dialog.colorInputTypeLabel.rgb')}
            </label>
            {colorInputType === 'hex' ? (
              <input
                type="color"
                value={currentHexColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 rounded border cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              />
            ) : (
              <input
                type="text"
                placeholder={t('dialog.inputPlaceholder.rgb')}
                value={tempColor ? RealizationColorUtils.rgbToHex(tempColor) ? '' : tempColor : ''}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            )}
          </div>

          {/* Current Status */}
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {isCustomized ? (
              <span className="text-orange-400">{t('dialog.status.customized')}</span>
            ) : (
              <span>{t('dialog.status.default')}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleApply}
              disabled={!tempColor}
              size="sm"
            >
              <Check className="h-4 w-4" />
              {t('dialog.buttons.apply')}
            </Button>
            
            {isCustomized && (
              <Button
                onClick={handleReset}
                variant="destructive"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
                {t('dialog.buttons.resetToDefault')}
              </Button>
            )}

            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              <X className="h-4 w-4" />
              {t('dialog.buttons.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};