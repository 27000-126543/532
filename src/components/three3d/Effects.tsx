import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom
        mipmapBlur
        intensity={1.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.1}
      />
      <Vignette
        offset={0.3}
        darkness={0.5}
      />
    </EffectComposer>
  );
}
