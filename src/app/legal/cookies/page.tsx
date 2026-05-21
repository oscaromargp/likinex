export default function CookiesPage() {
  return (
    <>
      <h1>Política de Cookies</h1>
      <p className="text-sm" style={{ color: '#71717A' }}>Última actualización: mayo 2026</p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas un sitio web. Se utilizan para recordar tus preferencias y mejorar tu experiencia de navegación.</p>

      <h2>2. Cookies que utilizamos</h2>
      <p>En LikinEX utilizamos exclusivamente cookies esenciales para el funcionamiento de la aplicación:</p>
      <ul>
        <li><strong>Cookie de sesión:</strong> para mantener tu sesión iniciada mientras usas la aplicación.</li>
        <li><strong>Cookie de preferencias:</strong> para recordar tu tema visual (oscuro/claro) y configuraciones de idioma.</li>
        <li><strong>Cookie de seguridad:</strong> para proteger contra accesos no autorizados y ataques CSRF.</li>
      </ul>
      <p><strong>No utilizamos</strong> cookies de rastreo, publicitarias ni de análisis de terceros.</p>

      <h2>3. Control de cookies</h2>
      <p>Puedes configurar tu navegador para bloquear o eliminar cookies. Sin embargo, algunas funcionalidades de LikinEX dejarían de funcionar correctamente si deshabilitas las cookies esenciales.</p>

      <h2>4. Cookies de Supabase</h2>
      <p>LikinEX utiliza Supabase como proveedor de autenticación. Supabase puede almacenar cookies necesarias para el funcionamiento del sistema de autenticación. Estas cookies son estrictamente necesarias y no se utilizan para rastreo.</p>

      <h2>5. Cambios en la política</h2>
      <p>Podemos actualizar esta política de cookies ocasionalmente. Los cambios serán publicados en esta página.</p>

      <h2>6. Contacto</h2>
      <p>Si tienes dudas sobre el uso de cookies, contáctanos en <a href="mailto:contacto@likinex.com">contacto@likinex.com</a>.</p>
    </>
  );
}
