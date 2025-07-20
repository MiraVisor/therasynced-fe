import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import CustomInput from '../common/input/CustomInput';

// Define the Zod schema
const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/,
      'Password must include lowercase and number, and be at least 8 characters',
    ),
});

// Infer TypeScript type from Zod schema
type FormData = z.infer<typeof formSchema>;

const MyForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'xyz@gmail.com',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log('Form Submitted..:', data);
    console.log('api error...', apiError);
    // Simulate API submission
    // await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Reset form to empty values
  const handleReset = () => {
    reset({
      email: '',
      password: '',
    });
  };

  // Fetch data and update form
  useEffect(() => {
    const fetchData = async () => {
      //   setIsLoading(true);
      setApiError(null);
      try {
        // Simulate API call (replace with actual endpoint)
        // const response = await fetch('/api/user/123');
        // const userData = await response.json();
        const newData: FormData = {
          email: 'user@example.com',
          password: 'password123',
        };
        reset(newData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setApiError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reset]);

  return (
    <div className="min-w-lg mx-auto p-4">
      {isLoading && <p className="text-blue-600">Loading...</p>}
      {/* {apiError && <p className="text-red-600">{apiError}</p>} */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CustomInput
          title="Email"
          placeholder="Enter your email"
          type="email"
          {...register('email')}
          errorMessage={errors.email?.message}
          ariaInvalid={!!errors.email}
        />
        <CustomInput
          title="Password"
          placeholder="Enter your password"
          type="password"
          {...register('password')}
          errorMessage={errors.password?.message}
          ariaInvalid={!!errors.password}
        />

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyForm;
