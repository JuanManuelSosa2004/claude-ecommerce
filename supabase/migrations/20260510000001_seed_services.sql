insert into public.services (name, description, price_cents, duration_minutes, slug, is_active) values
(
  'Consulta clínica general',
  'Atención médica general con profesional certificado. Incluye revisación, diagnóstico y receta médica si corresponde.',
  350000,
  30,
  'consulta-clinica-general',
  true
),
(
  'Sesión de psicología',
  'Sesión individual con psicólogo/a clínico/a. Enfoque cognitivo-conductual. Primera consulta sin cargo de evaluación.',
  600000,
  50,
  'sesion-psicologia',
  true
),
(
  'Masaje relajante',
  'Masaje corporal completo con técnicas de relajación profunda. Incluye aromaterapia y música ambiente.',
  450000,
  60,
  'masaje-relajante',
  true
),
(
  'Corte y peinado',
  'Corte de cabello personalizado según tu tipo de rostro, lavado, secado y peinado incluidos.',
  250000,
  45,
  'corte-y-peinado',
  true
);

-- Disponibilidad: lunes a viernes 9-18hs para todos los servicios
insert into public.availability (service_id, day_of_week, start_time, end_time)
select s.id, d.day, '09:00'::time, '18:00'::time
from public.services s
cross join (values (0),(1),(2),(3),(4)) as d(day);
