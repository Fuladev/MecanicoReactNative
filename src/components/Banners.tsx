import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View, type ScrollViewInstance } from 'react-native';
import { colors, spacing } from '../theme';

const BANNERS = [
  require('../../assets/images/banners/banner_1.png'),
  require('../../assets/images/banners/banner_2.png'),
  require('../../assets/images/banners/banner_3.png'),
  require('../../assets/images/banners/banner_4.png'),
];

export function Banners() {
  const { width } = useWindowDimensions();
  const w = width - spacing(10);
  const h = Math.round((w * 525) / 1366);
  const ref = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % BANNERS.length;
        ref.current?.scrollTo({ x: next * w, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [w]);

  return (
    <View style={{ marginBottom: spacing(5) }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / w))}
        style={{ width: w, height: h, borderRadius: 16 }}
      >
        {BANNERS.map((src, i) => (
          <Image key={i} source={src} style={{ width: w, height: h }} resizeMode="cover" accessibilityIgnoresInvertColors />
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && { backgroundColor: colors.primary, width: 16 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing(2) },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
});
