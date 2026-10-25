import { View, type ViewStyle } from 'react-native';

import type { KernelResult, Service } from '../domain/types';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../theme/ThemeProvider';
import { DashedRule } from './ui/DashedRule';
import { T } from './ui/T';

function serviceTag(service: Service, hot: boolean): string {
  if (hot) return 'HOT LIQUID';
  return service === 'NONE' ? 'NO SERVICE' : service.replace('_', ' ');
}

/** Top-down digital twin of B737-8 rows 26–28 + aft galley. */
export function CabinTwin({ m, service }: { m: KernelResult; service: Service }) {
  const { c } = useTheme();
  const { narrow } = useResponsive();
  const seat = narrow ? 24 : 34;
  const aisleW = narrow ? 96 : 128;

  const warn: ViewStyle = { borderWidth: 2, borderColor: c.tightBar, backgroundColor: c.tightBg };
  const ok: ViewStyle = { borderWidth: 2, borderColor: c.passBar, backgroundColor: c.passBg };

  const seats = (align: 'flex-start' | 'flex-end') => (
    <View style={{ flex: 1, flexDirection: 'row', gap: narrow ? 4 : 6, justifyContent: align }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{ width: seat, height: seat, borderRadius: narrow ? 6 : 8, backgroundColor: c.seatSoft, borderWidth: 1, borderColor: c.line }}
        />
      ))}
    </View>
  );

  const rows = [26, 27, 28].map((n, i) => {
    const showCart = m.cartOnView && i === 1;
    return (
      <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: narrow ? 6 : 12 }}>
        {seats('flex-end')}
        <View style={{ width: aisleW, height: 64, flexDirection: 'row', alignItems: 'center' }}>
          <DashedRule color={c.line} />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {showCart ? (
              <View
                style={[
                  { width: narrow ? 88 : 112, paddingVertical: 6, paddingHorizontal: 4, borderRadius: 10, alignItems: 'center', gap: 1 },
                  m.cartLoose ? warn : ok,
                ]}
              >
                {['FA3 · CART', m.cartLoose ? 'UNSECURED' : 'SECURED', serviceTag(service, m.hot)].map((line) => (
                  <T key={line} size={10} weight={800} tracking={0.03} color={m.cartLoose ? c.tight : c.pass}>
                    {line}
                  </T>
                ))}
              </View>
            ) : (
              <T size={12} weight={700} color={c.muted}>
                Row {n}
              </T>
            )}
          </View>
          <DashedRule color={c.line} />
        </View>
        {seats('flex-start')}
      </View>
    );
  });

  const aftBox = (style: ViewStyle, title: string, sub: string, color: string, flex = 1, titleSize = 13) => (
    <View style={[{ flex, minHeight: 72, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 2 }, style]}>
      <T size={titleSize} weight={800} color={color}>
        {title}
      </T>
      <T size={11} weight={800} color={color}>
        {sub}
      </T>
    </View>
  );

  return (
    <View
      style={{
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
        backgroundColor: c.card,
        borderWidth: 2,
        borderColor: c.line,
        borderTopLeftRadius: narrow ? 80 : 120,
        borderTopRightRadius: narrow ? 80 : 120,
        borderBottomLeftRadius: narrow ? 28 : 36,
        borderBottomRightRadius: narrow ? 28 : 36,
        paddingTop: narrow ? 32 : 40,
        paddingHorizontal: narrow ? 14 : 28,
        paddingBottom: narrow ? 20 : 28,
        gap: 18,
      }}
    >
      <T size={13} weight={800} tracking={0.06} align="center">
        FORWARD ↑
      </T>
      {!m.cartOnView ? (
        <View style={{ alignSelf: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: c.tightBg }}>
          <T size={13} weight={700} color={c.tight}>
            ↑ FA3 · Cart in mid cabin (outside view)
          </T>
        </View>
      ) : null}
      {rows}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
        {aftBox(m.lavOcc ? warn : ok, 'LAV 1', m.lavOcc ? 'OCCUPIED' : 'EMPTY', m.lavOcc ? c.tight : c.pass)}
        {aftBox({ borderWidth: 2, borderColor: c.accent, backgroundColor: c.accentSoft }, 'AFT GALLEY', 'FA4', c.accentInk, 1.4, 15)}
        {aftBox(ok, 'LAV 2', 'EMPTY', c.pass)}
      </View>
      <T size={13} weight={800} tracking={0.06} align="center">
        AFT ↓
      </T>
    </View>
  );
}
