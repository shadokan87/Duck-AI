type taskType = Database['public']['Tables']['task']['Insert'];
async function addTask(user: DecodedUser, attachments: string[], prompt: string, state: taskType['state'] = 'AWAITING_ATTACHMENTS') {
  const { data, error } = await supabase
    .from('task')
    .insert([
      {
        attachments: attachments.map(attachment => ({path: attachment, content: "NONE"})),
        created_by: user.sub,
        prompt,
        state
      }
    ]);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Data inserted successfully:', data);
  }
  return data;
}