# Couple photographs

The photographs now live in **`public/images/couple/`** and are served as-is
(`images/couple/<file>`) — they are never re-encoded, resized or replaced.

`src/lib/photos.ts` lists them in order together with their intrinsic size, and
picks the `object-position` used by each scene so faces are never cropped.

| File                       | Intrinsic | Used as                                     |
| -------------------------- | --------- | ------------------------------------------- |
| `bishoy-marina-01.jpeg`    | 1072×1467 | Gallery · Story                             |
| `bishoy-marina-02.jpeg`    | 1126×1600 | Gallery · Story                             |
| `bishoy-marina-04.jpeg`    | 974×1280  | Gallery · Story · Message background        |
| `bishoy-marina-05.jpeg`    | 960×1280  | Gallery · Story                             |
| `bishoy-marina-06.jpeg`    | 960×1280  | Hero reveal · Gallery · Story · reflection  |
| `bishoy-marina-07.jpeg`    | 1254×1254 | Gallery · Story                             |
| `bishoy-marina-08.jpeg`    | 1086×1448 | Gallery                                     |

Adding or removing a photo means editing that one manifest at the top of
`src/lib/photos.ts`. The wedding music lives in `public/audio/` and is listed in
`src/lib/audio.ts`.
