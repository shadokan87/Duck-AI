"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function addTask(user, attachments, prompt, state = 'AWAITING_ATTACHMENTS') {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('task')
            .insert([
            {
                attachments: attachments.map(attachment => ({ path: attachment, content: "NONE" })),
                created_by: user.sub,
                prompt,
                state
            }
        ]);
        if (error) {
            console.error('Error inserting data:', error);
        }
        else {
            console.log('Data inserted successfully:', data);
        }
        return data;
    });
}
