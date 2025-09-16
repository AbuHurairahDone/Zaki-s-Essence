import React, { useEffect, useState } from 'react';
import { ContactService } from '../../services/contactService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faClock } from '@fortawesome/free-solid-svg-icons';

function ContactMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMessages() {
            setLoading(true);
            try {
                const msgs = await ContactService.getAllMessages();
                setMessages(msgs);
            } catch (err) {
                setMessages([]);
            } finally {
                setLoading(false);
            }
        }
        fetchMessages();
    }, []);

    return (
        <section className="py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Customer Messages</h1>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-amber-950 border-t-transparent rounded-full"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No messages found.</div>
                ) : (
                    <div className="space-y-6">
                        {messages.map(msg => (
                            <div key={msg.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <FontAwesomeIcon icon={faUser} className="text-amber-950 mr-2" />
                                        <span className="font-semibold text-gray-800">{msg.name}</span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-2" />
                                        <span className="text-gray-600 text-sm">{msg.phone}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-gray-700 text-base">{msg.message}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center text-xs text-gray-500 mb-2">
                                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default ContactMessages;
