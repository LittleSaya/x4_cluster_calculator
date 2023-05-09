import { Color, MeshBasicMaterial, DoubleSide } from 'three'

const SIDE = DoubleSide;

const factionColors = {
  unclaimed: {
    hexagonEdge: new Color().setHSL(137 / 255, 13 / 255, 136 / 255),
    // hexagonPlane: new Color().setHSL(147 / 255, 8 / 255, 198 / 255),
    hexagonPlane: new Color().setHSL(137 / 255, 13 / 255, 136 / 255 / 10),
  },
  xen: {
    hexagonEdge: new Color().setHSL(220 / 255, 111 / 255, 127 / 255),
    // hexagonPlane: new Color().setHSL(221 / 255, 147 / 255, 143 / 255),
    hexagonPlane: new Color().setHSL(220 / 255, 111 / 255, 127 / 255 / 10),
  },
  arg: {
    hexagonEdge: new Color().setHSL(131 / 255, 240 / 255, 85 / 255),
    // hexagonPlane: new Color().setHSL(132 / 255, 189 / 255, 138 / 255),
    hexagonPlane: new Color().setHSL(131 / 255, 240 / 255, 85 / 255 / 10),
  },
  ant: {
    hexagonEdge: new Color().setHSL(131 / 255, 124 / 255, 138 / 255),
    // hexagonPlane: new Color().setHSL(131 / 255, 212 / 255, 167 / 255),
    hexagonPlane: new Color().setHSL(131 / 255, 124 / 255, 138 / 255 / 10),
  },
  hat: {
    hexagonEdge: new Color().setHSL(124 / 255, 240 / 255, 68 / 255),
    // hexagonPlane: new Color().setHSL(123 / 255, 240 / 255, 81 / 255),
    hexagonPlane: new Color().setHSL(124 / 255, 240 / 255, 68 / 255 / 10),
  },
  par: {
    hexagonEdge: new Color().setHSL(194 / 255, 44 / 255, 113 / 255),
    // hexagonPlane: new Color().setHSL(189 / 255, 70 / 255, 159 / 255),
    hexagonPlane: new Color().setHSL(194 / 255, 44 / 255, 113 / 255 / 10),
  },
  hop: {
    hexagonEdge: new Color().setHSL(228 / 255, 97 / 255, 142 / 255),
    // hexagonPlane: new Color().setHSL(228 / 255, 164 / 255, 171 / 255),
    hexagonPlane: new Color().setHSL(228 / 255, 97 / 255, 142 / 255 / 10),
  },
  tel: {
    hexagonEdge: new Color().setHSL(44 / 255, 173 / 255, 90 / 255),
    // hexagonPlane: new Color().setHSL(43 / 255, 171 / 255, 111 / 255),
    hexagonPlane: new Color().setHSL(44 / 255, 173 / 255, 90 / 255 / 10),
  },
  zya: {
    hexagonEdge: new Color().setHSL(13 / 255, 185 / 255, 106 / 255),
    // hexagonPlane: new Color().setHSL(13 / 255, 215 / 255, 151 / 255),
    hexagonPlane: new Color().setHSL(13 / 255, 185 / 255, 106 / 255 / 10),
  },
  frf: {
    hexagonEdge: new Color().setHSL(25 / 255, 198 / 255, 106 / 255),
    // hexagonPlane: new Color().setHSL(25 / 255, 230 / 255, 130 / 255),
    hexagonPlane: new Color().setHSL(25 / 255, 198 / 255, 106 / 255 / 10),
  },
  ter: {
    hexagonEdge: new Color().setHSL(147 / 255, 55 / 255, 158 / 255),
    // hexagonPlane: new Color().setHSL(147 / 255, 100 / 255, 188 / 255),
    hexagonPlane: new Color().setHSL(147 / 255, 55 / 255, 158 / 255 / 10),
  },
  pio: {
    hexagonEdge: new Color().setHSL(113 / 255, 71 / 255, 106 / 255),
    // hexagonPlane: new Color().setHSL(113 / 255, 78 / 255, 127 / 255),
    hexagonPlane: new Color().setHSL(113 / 255, 71 / 255, 106 / 255 / 10),
  },
  vig: {
    hexagonEdge: new Color().setHSL(170 / 255, 72 / 255, 160 / 255),
    // hexagonPlane: new Color().setHSL(169 / 255, 77 / 255, 189 / 255),
    hexagonPlane: new Color().setHSL(170 / 255, 72 / 255, 160 / 255 / 10),
  },
  rip: {
    hexagonEdge: new Color().setHSL(136 / 255, 75 / 255, 64 / 255),
    // hexagonPlane: new Color().setHSL(137 / 255, 85 / 255, 128 / 255),
    hexagonPlane: new Color().setHSL(136 / 255, 75 / 255, 64 / 255 / 10),
  },
  bor: {
    hexagonEdge: new Color().setHSL(125 / 255, 240 / 255, 93 / 255),
    // hexagonPlane: new Color().setHSL(125 / 255, 101 / 255, 186 / 255),
    hexagonPlane: new Color().setHSL(125 / 255, 240 / 255, 93 / 255 / 10),
  },
};

export const sectorName = new MeshBasicMaterial({ color: 0xFFFFFF });

export const clusterHexagonEdge = {
  unclaimed: new MeshBasicMaterial({ color: factionColors.unclaimed.hexagonEdge, side: SIDE }),
  xen: new MeshBasicMaterial({ color: factionColors.xen.hexagonEdge, side: SIDE }),
  arg: new MeshBasicMaterial({ color: factionColors.arg.hexagonEdge, side: SIDE }),
  ant: new MeshBasicMaterial({ color: factionColors.ant.hexagonEdge, side: SIDE }),
  hat: new MeshBasicMaterial({ color: factionColors.hat.hexagonEdge, side: SIDE }),
  par: new MeshBasicMaterial({ color: factionColors.par.hexagonEdge, side: SIDE }),
  hop: new MeshBasicMaterial({ color: factionColors.hop.hexagonEdge, side: SIDE }),
  tel: new MeshBasicMaterial({ color: factionColors.tel.hexagonEdge, side: SIDE }),
  zya: new MeshBasicMaterial({ color: factionColors.zya.hexagonEdge, side: SIDE }),
  frf: new MeshBasicMaterial({ color: factionColors.frf.hexagonEdge, side: SIDE }),
  ter: new MeshBasicMaterial({ color: factionColors.ter.hexagonEdge, side: SIDE }),
  pio: new MeshBasicMaterial({ color: factionColors.pio.hexagonEdge, side: SIDE }),
  vig: new MeshBasicMaterial({ color: factionColors.vig.hexagonEdge, side: SIDE }),
  rip: new MeshBasicMaterial({ color: factionColors.rip.hexagonEdge, side: SIDE }),
  bor: new MeshBasicMaterial({ color: factionColors.bor.hexagonEdge, side: SIDE }),
  undefined: new MeshBasicMaterial({ color: new Color(1.0, 1.0, 1.0), side: SIDE }),
  mix: new MeshBasicMaterial({ color: new Color(1.0, 1.0, 1.0), side: SIDE }),
};

export const sectorHexagonEdge = {
  unclaimed: new MeshBasicMaterial({ color: factionColors.unclaimed.hexagonEdge, side: SIDE }),
  xen: new MeshBasicMaterial({ color: factionColors.xen.hexagonEdge, side: SIDE }),
  arg: new MeshBasicMaterial({ color: factionColors.arg.hexagonEdge, side: SIDE }),
  ant: new MeshBasicMaterial({ color: factionColors.ant.hexagonEdge, side: SIDE }),
  hat: new MeshBasicMaterial({ color: factionColors.hat.hexagonEdge, side: SIDE }),
  par: new MeshBasicMaterial({ color: factionColors.par.hexagonEdge, side: SIDE }),
  hop: new MeshBasicMaterial({ color: factionColors.hop.hexagonEdge, side: SIDE }),
  tel: new MeshBasicMaterial({ color: factionColors.tel.hexagonEdge, side: SIDE }),
  zya: new MeshBasicMaterial({ color: factionColors.zya.hexagonEdge, side: SIDE }),
  frf: new MeshBasicMaterial({ color: factionColors.frf.hexagonEdge, side: SIDE }),
  ter: new MeshBasicMaterial({ color: factionColors.ter.hexagonEdge, side: SIDE }),
  pio: new MeshBasicMaterial({ color: factionColors.pio.hexagonEdge, side: SIDE }),
  vig: new MeshBasicMaterial({ color: factionColors.vig.hexagonEdge, side: SIDE }),
  rip: new MeshBasicMaterial({ color: factionColors.rip.hexagonEdge, side: SIDE }),
  bor: new MeshBasicMaterial({ color: factionColors.bor.hexagonEdge, side: SIDE }),
  undefined: new MeshBasicMaterial({ color: new Color(1.0, 1.0, 1.0), side: SIDE }),
  mix: new MeshBasicMaterial({ color: new Color(1.0, 1.0, 1.0), side: SIDE }),
};

export const sectorHexagonPlane = {
  unclaimed: new MeshBasicMaterial({ color: factionColors.unclaimed.hexagonPlane, opacity: 0.25, side: SIDE }),
  xen: new MeshBasicMaterial({ color: factionColors.xen.hexagonPlane, opacity: 0.25, side: SIDE }),
  arg: new MeshBasicMaterial({ color: factionColors.arg.hexagonPlane, opacity: 0.25, side: SIDE }),
  ant: new MeshBasicMaterial({ color: factionColors.ant.hexagonPlane, opacity: 0.25, side: SIDE }),
  hat: new MeshBasicMaterial({ color: factionColors.hat.hexagonPlane, opacity: 0.25, side: SIDE }),
  par: new MeshBasicMaterial({ color: factionColors.par.hexagonPlane, opacity: 0.25, side: SIDE }),
  hop: new MeshBasicMaterial({ color: factionColors.hop.hexagonPlane, opacity: 0.25, side: SIDE }),
  tel: new MeshBasicMaterial({ color: factionColors.tel.hexagonPlane, opacity: 0.25, side: SIDE }),
  zya: new MeshBasicMaterial({ color: factionColors.zya.hexagonPlane, opacity: 0.25, side: SIDE }),
  frf: new MeshBasicMaterial({ color: factionColors.frf.hexagonPlane, opacity: 0.25, side: SIDE }),
  ter: new MeshBasicMaterial({ color: factionColors.ter.hexagonPlane, opacity: 0.25, side: SIDE }),
  pio: new MeshBasicMaterial({ color: factionColors.pio.hexagonPlane, opacity: 0.25, side: SIDE }),
  vig: new MeshBasicMaterial({ color: factionColors.vig.hexagonPlane, opacity: 0.25, side: SIDE }),
  rip: new MeshBasicMaterial({ color: factionColors.rip.hexagonPlane, opacity: 0.25, side: SIDE }),
  bor: new MeshBasicMaterial({ color: factionColors.bor.hexagonPlane, opacity: 0.25, side: SIDE }),
  undefined: new MeshBasicMaterial({ color: new Color(1.0, 1.0, 1.0), opacity: 0.25, side: SIDE }),
  mix: new MeshBasicMaterial({ color: new Color(1.0, 1.0, 1.0), opacity: 0.25, side: SIDE }),
};
