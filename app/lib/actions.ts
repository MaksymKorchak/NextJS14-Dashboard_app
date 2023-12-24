'use server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { checkIfEmailIsValid } from './data';
import bcrypt from 'bcrypt';

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message: string | null;
};

export type LoginState = {
  errors?: {
    name?: string[];
    password?: string[];
    email?: string[];
  };
  message: string | null;
};


const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    required_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    required_error: 'Please select a status.',
  }),
  date: z.string(),
});

const LoginFormSchema = z.object({
  name: z.string().min(1, { message: 'This field has to be filled.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' }),
  email: z
    .string()
    .min(1, { message: 'This field has to be filled.' })
    .email('This is not a valid email.')
    .refine(async (e) => {
      return await checkIfEmailIsValid(e);
    }, 'This email is already registered'),
});

//createUser
export async function createUser(prevState: LoginState, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = await LoginFormSchema.safeParseAsync(
    Object.fromEntries(formData.entries()),
  );

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register User.',
    };
  }
  // Prepare data for insertion into the database
  const { name, email, password } = validatedFields.data;
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert data into the database
  try {
    await sql`
            INSERT INTO users (id, name, email, password)
            VALUES (${id}, ${name}, ${email}, ${hashedPassword})
        `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create User.',
    };
  }

  // Automatically log in the user
  await signIn('credentials', formData);

  // Revalidate the cache for the users page and redirect the user.
  revalidatePath('/login');
  redirect('/login');
}

// createInvoice
const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse(
    Object.fromEntries(formData.entries()),
  );
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// updateInvoice
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse(
    Object.fromEntries(formData.entries()),
  );

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    // If a database error occurs, return a more specific error.
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  // Insert data into the database
  try {
    await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// deleteInvoice
export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Invoice.',
    };
  }
}

//authenticate
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
