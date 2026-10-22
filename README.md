# Il Fuogo

Sitio de Il Fuogo, cocina ítalo-patagónica en Puerto Varas.

**Ver el sitio:** https://il-fuogo-nicolira.aurorathyme9.chatgpt.site

Diseño original: https://www.figma.com/design/XWYQ0ejznyJD7Pm8iuCiUM/Il-Fuogo?node-id=707-2

## Abrir y editar

El sitio usa HTML, CSS y JavaScript, sin compilación ni dependencias de npm.

```sh
python3 -m http.server 4173 --directory dist
```

Abrir http://localhost:4173. Para publicar en otro servicio estático, usar `dist` como carpeta pública.

## Archivos

- `dist/index.html`: documento y enlace a Adobe Fonts.
- `dist/app.js`: páginas, navegación, reservas y carrito.
- `dist/styles.css`: diseño adaptable y animaciones.
- `dist/menu-layout.json`: posiciones de los elementos de la carta de escritorio según Figma.
- `dist/menu.json`: contenido de la carta adaptable para teléfonos.
- `dist/brand-assets.json`: correspondencia con los nombres originales de los SVG entregados.
- `dist/assets/`: fotografías, ilustraciones y textos vectorizados, incluidos localmente.

Las fuentes Obviously y Vivaldi MN cargan desde el proyecto de Adobe Fonts `eun5ygn`. Los títulos vectorizados conservan sus proporciones originales. Las transiciones respetan la preferencia de movimiento reducido del dispositivo.

## Reservas y pedidos

El formulario prepara un mensaje para el WhatsApp del restaurante con nombre, correo, fecha, hora y personas. El visitante debe pulsar **Enviar** en WhatsApp y esperar la confirmación del restaurante. No hay envío automático ni almacenamiento de reservas en un servidor.

El carrito guarda tallas y cantidades en el navegador y prepara el pedido por WhatsApp. No procesa pagos.
