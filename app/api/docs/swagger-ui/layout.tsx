import { Metadata } from 'next';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-ui-custom.css';

export const metadata: Metadata = {
  title: 'API Documentation - SOP Manager',
  description: 'Documentation interactive de l\'API SOP Manager',
};

export default function SwaggerUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="swagger-ui-container">
      {children}
    </div>
  );
} 