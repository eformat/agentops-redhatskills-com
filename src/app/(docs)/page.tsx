import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/tracing/connect-to-mlflow');
}
