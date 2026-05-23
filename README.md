# Pulse Football Landing

Landing estática y liviana para QR / campañas de Pulse Football.

## Estructura

```txt
index.html
styles.css
script.js
assets/
```

## Links de descarga

Los links están centralizados en `script.js`:

```js
const CONFIG = {
  iosUrl: "...",
  androidUrl: "...",
  gaMeasurementId: "",
};
```

Cuando Android pase de testing a producción, reemplazar:

```txt
https://play.google.com/apps/testing/com.diegotubito.pulsefootball
```

por:

```txt
https://play.google.com/store/apps/details?id=com.diegotubito.pulsefootball
```

## Google Analytics GA4

Cuando esté creada la propiedad GA4, pegar el Measurement ID en `script.js`:

```js
gaMeasurementId: "G-XXXXXXXXXX",
```

## Redirect

- iOS -> App Store
- Android -> Google Play / testing
- Desktop -> muestra ambos botones

Para evitar redirect y ver la landing en mobile:

```txt
/?redirect=0
```

Para forzar idioma:

```txt
/?lang=es
/?lang=en
```

También se pueden combinar:

```txt
/?redirect=0&lang=en
```
