import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Login" />

            {status && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <p className="text-base font-semibold text-emerald-700">{status}</p>
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email" className="text-base font-semibold text-slate-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="contoh@email.com"
                                    className="h-12 text-base px-4"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-base font-semibold text-slate-700">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm font-medium"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan password"
                                    className="h-12 text-base px-4"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 py-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="h-5 w-5"
                                />
                                <Label htmlFor="remember" className="text-base font-medium text-slate-700 cursor-pointer">
                                    Ingat saya
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 h-14 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                {processing ? 'Memproses...' : 'Login'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Selamat Datang Kembali',
    description: 'Masukkan email dan password untuk mengakses sistem',
};
