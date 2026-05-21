export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de Privacidad</h1>
      <p className="text-sm" style={{ color: '#71717A' }}>Última actualización: mayo 2026</p>

      <h2>1. Información que recopilamos</h2>
      <p>En LikinEX recopilamos la siguiente información cuando utilizas nuestra aplicación:</p>
      <ul>
        <li><strong>Datos de registro:</strong> nombre, correo electrónico y contraseña (encriptada).</li>
        <li><strong>Datos financieros:</strong> información de transacciones, cuentas bancarias, tarjetas de crédito y contactos que tú mismo ingresas.</li>
        <li><strong>Datos de uso:</strong> estadísticas anónimas sobre cómo interactúas con la aplicación para mejorar la experiencia.</li>
      </ul>

      <h2>2. Cómo usamos tu información</h2>
      <ul>
        <li>Proveer y mantener el servicio de gestión de liquidez.</li>
        <li>Generar reportes, proyecciones y alertas personalizadas.</li>
        <li>Mejorar la funcionalidad y experiencia del usuario.</li>
        <li>Enviar notificaciones vía WhatsApp solo con tu consentimiento explícito.</li>
      </ul>

      <h2>3. Protección de datos</h2>
      <p>Utilizamos Supabase como infraestructura de base de datos con encriptación en tránsito (TLS) y en reposo. Tus datos financieros no se comparten con terceros bajo ninguna circunstancia, excepto cuando sea requerido por ley.</p>

      <h2>4. Tus derechos</h2>
      <p>Tienes derecho a:</p>
      <ul>
        <li>Acceder a tus datos personales almacenados.</li>
        <li>Solicitar la corrección o eliminación de tus datos.</li>
        <li>Exportar tus datos en formato CSV o PDF.</li>
        <li>Cancelar tu cuenta y eliminar toda tu información en cualquier momento.</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>Utilizamos cookies esenciales para el funcionamiento de la aplicación. No utilizamos cookies de rastreo ni publicitarias. Consulta nuestra <a href="/legal/cookies">Política de Cookies</a> para más información.</p>

      <h2>6. Contacto</h2>
      <p>Si tienes preguntas sobre esta política, contáctanos en <a href="mailto:contacto@likinex.com">contacto@likinex.com</a>.</p>
    </>
  );
}
