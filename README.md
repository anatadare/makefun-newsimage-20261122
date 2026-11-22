# The World Today - Sunday 22 November 2026

[![news-image-20261122](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122)
[![rank](https://make.fun/badge/news-image-20261122/anatadare/makefun-newsimage-20261122/rank.svg)](https://make.fun/bounty/news-image-20261122)
[![reward](https://make.fun/badge/news-image-20261122/anatadare/makefun-newsimage-20261122/reward.svg)](https://make.fun/bounty/news-image-20261122)

A program that draws a newspaper front page summing up the world news of
Sunday 22 November 2026 and writes it to `/output/entry.png`. Five stories,
each verified against wire reports from that day: the COP31 climate talks
nearing a deal in Antalya, Hong Kong's Election Committee vote, Nepal's prime
minister arriving in Delhi, a magnitude 4.1 earthquake in Myanmar, and the
Las Vegas Grand Prix.

The front page is drawn pixel by pixel in pure TypeScript: a hand-built 5x7
bitmap font, flat vector-style graphics, and a PNG encoder written from
scratch. No network, no fonts, no dependencies, and every run writes the
exact same bytes.

## Run

```sh
node main.ts
```

Writes `/output/entry.png` (1024x1024, under 1 MiB).
